import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async cadastrar(dto: CadastroDto) {
    const email = dto.email.trim().toLowerCase();

    const existente = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existente) {
      throw new ConflictException('Este email já está cadastrado');
    }

    const senhaHash = await argon2.hash(dto.senha);

    const conta = await this.prisma.conta.create({
      data: {
        nome: dto.nomeLoja.trim(),
        ramo: dto.ramoLoja.trim(),
        usuarios: {
          create: {
            nome: dto.nomeLoja.trim(),
            email,
            senhaHash,
            papel: 'ADMIN',
          },
        },
      },
      include: { usuarios: true },
    });

    const usuario = conta.usuarios[0];

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      conta: { id: conta.id, nome: conta.nome, ramo: conta.ramo },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { conta: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaConfere = await argon2.verify(usuario.senhaHash, dto.senha);

    if (!senhaConfere) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!usuario.ativo || !usuario.conta.ativa) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLoginEm: new Date() },
    });

    const token = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      contaId: usuario.contaId,
      papel: usuario.papel,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        conta: {
          id: usuario.conta.id,
          nome: usuario.conta.nome,
          ramo: usuario.conta.ramo,
        },
      },
    };
  }
}