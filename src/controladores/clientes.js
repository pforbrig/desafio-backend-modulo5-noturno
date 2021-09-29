const knex = require('../conexao');
const schemaCadastroCliente = require('../validacoes/schemaCadastroCliente');

const cadastrarCliente = async (req, res) => {
    const { nome, email, telefone, cpf, cep, logradouro, complemento, bairro, cidade, estado } = req.body;
    const { id } = req.usuario;

    try {
        await schemaCadastroCliente.validate(req.body);

        const cpfExiste = await knex('clientes').where({ cpf, usuario_id: id }).first();

        if (cpfExiste) {
            return res.status(400).json("Você já tem um cliente com esse CPF!");
        }

        const cliente = await knex('clientes').insert({
            nome,
            email,
            telefone,
            cpf,
            cep,
            logradouro,
            complemento,
            bairro,
            cidade,
            estado,
            usuario_id: id,
        }).returning('*');

        if (!cliente) {
            return res.status(400).json("O cliente não foi cadastrado.");
        }

        return res.status(200).json(cliente[0]);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};
const obterClientes = async (req, res) => {
    const { id } = req.usuario;

    try {
        const clientesDoUsuario = await knex('clientes').where({ usuario_id: id });

        return res.status(200).json(clientesDoUsuario);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

module.exports = {
    cadastrarCliente,
    obterClientes
}