const knex = require('../conexao');
const bcrypt = require('bcrypt');
const schemaCadastroUsuario = require('../validacoes/schemaCadastroUsuario');

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
};
const atualizarPerfil = async (req, res) => {
};

module.exports = {
    cadastrarUsuario,
    obterPerfil,
    atualizarPerfil
}