const knex = require('../conexao');
const schemaCadastroCliente = require('../validacoes/schemaCadastroCliente');

const cadastrarCliente = async (req, res) => {
    const { nome, email, telefone, cpf, cep, logradouro, complemento, bairro, cidade, estado, referencia } = req.body;
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
            referencia,
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
const listarClientes = async (req, res) => {
    const { id } = req.usuario;

    try {
        const clientesDoUsuario = await knex('clientes').where({ usuario_id: id });

        return res.status(200).json(clientesDoUsuario);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};
const obterCliente = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const cliente = await knex('clientes').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!cliente) {
            return res.status(404).json('Cliente não encontrado ou não está vinculado ao usuario logado!');
        }

        return res.status(200).json(cliente);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}
const editarCliente = async (req, res) => {
    let { nome, email, telefone, cpf, cep, logradouro, complemento, bairro, cidade, estado, referencia } = req.body;
    const { usuario_id } = req.usuario;
    const { id } = req.params;

    if (!nome && !email && !telefone && !cpf && !cep && !logradouro && !complemento && !bairro && !cidade && !estado && !referencia) {
        return res.status(400).json('Você deve informar ao menos um campo para editar o cliente');
    }

    try {
        const clienteExiste = await knex('clientes').where({ id }).first();

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
        const resposta = await knex('usuarios').where({ id }).first();

        return res.status(200).json(resposta);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};
module.exports = {
    cadastrarCliente,
    listarClientes,
    obterCliente,
    editarCliente
}