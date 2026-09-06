import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';
import { SolicitarRecuperacaoDto } from './dto/solicitar-recuperacao.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

const VALIDADE_TOKEN_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private gerarHashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

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

  async solicitarRecuperacao(dto: SolicitarRecuperacaoDto) {
    const email = dto.email.trim().toLowerCase();
    const mensagemPadrao = {
      mensagem:
        'Se este email estiver cadastrado, você receberá as instruções de recuperação.',
    };

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.ativo) {
      return mensagemPadrao;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.gerarHashToken(token);

    await this.prisma.tokenRecuperacaoSenha.updateMany({
      where: { usuarioId: usuario.id, usadoEm: null },
      data: { usadoEm: new Date() },
    });

    await this.prisma.tokenRecuperacaoSenha.create({
      data: {
        usuarioId: usuario.id,
        tokenHash,
        expiraEm: new Date(Date.now() + VALIDADE_TOKEN_MS),
      },
    });

    try {
      await this.emailService.enviarRecuperacaoSenha(usuario.email, token);
    } catch {
      this.logger.error('Falha no envio do email de recuperação');
    }

    return mensagemPadrao;
  }

  async redefinirSenha(dto: RedefinirSenhaDto) {
    const tokenHash = this.gerarHashToken(dto.token);

    const registro = await this.prisma.tokenRecuperacaoSenha.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });

    if (!registro || registro.usadoEm || registro.expiraEm < new Date()) {
      throw new BadRequestException('Link inválido ou expirado');
    }

    const senhaHash = await argon2.hash(dto.senha);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: registro.usuarioId },
        data: { senhaHash },
      }),
      this.prisma.tokenRecuperacaoSenha.update({
        where: { id: registro.id },
        data: { usadoEm: new Date() },
      }),
    ]);

    return { mensagem: 'Senha alterada com sucesso' };
  }
}