const knex = require('../conexao');
const bcrypt = require('bcrypt');
const schemaCadastroUsuario = require('../validacoes/schemaCadastroUsuario');
const schemaAtualizarUsuario = require('../validacoes/schemaAtualizarUsuario');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        await schemaCadastroUsuario.validate(req.body);

        const emailExiste = await knex('usuarios').where({ email }).first();

        if (emailExiste) {
            return res.status(400).json("O email já existe");
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = await knex('usuarios').insert({
            nome,
            email,
            senha: senhaCriptografada,
        }).returning('*');

        if (!usuario) {
            return res.status(400).json("O usuário não foi cadastrado.");
        }

        return res.status(200).json(usuario[0]);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const obterPerfil = async (req, res) => {
    return res.status(200).json(req.usuario);
};

const atualizarPerfil = async (req, res) => {
    let { nome, email, senha, cpf, telefone } = req.body;
    const { id } = req.usuario;

    if (!nome && !email && !senha && !cpf && !telefone) {
        return res.status(400).json('Você deve informar ao menos um campo para atualizar');
    }

    try {
        const usuarioExiste = await knex('usuarios').where({ id }).first();

        if (!usuarioExiste) {
            return res.status(404).json('Usuario não encontrado');
        }

        if (senha) {
            senha = await bcrypt.hash(senha, 10);
        }

        if (email && email !== req.usuario.email) {
            await schemaAtualizarUsuario.validate(req.body);

            const emailUsuarioExiste = await knex('usuarios').where({ email }).first();

            if (emailUsuarioExiste) {
                return res.status(400).json('O email informado já está cadastrado.');
            }
        }

        const usuarioAtualizado = await knex('usuarios')
            .where({ id })
            .update({
                nome,
                email,
                senha,
                cpf,
                telefone
            });

        if (!usuarioAtualizado) {
            return res.status(400).json("O usuario não foi atualizado");
        }

        return res.status(200).json('O usuario foi atualizado com sucesso.');

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

module.exports = {
    cadastrarUsuario,
    obterPerfil,
    atualizarPerfil
}