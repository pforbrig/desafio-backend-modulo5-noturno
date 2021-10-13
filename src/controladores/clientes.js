const knex = require('../conexao');
const { format } = require('date-fns');
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

        const emailExiste = await knex('clientes').where({ email, usuario_id: id }).first();

        if (emailExiste) {
            return res.status(400).json("Você já tem um cliente com esse email!");
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
        const clientesDoUsuario = await knex('clientes')
            .where({ usuario_id: id });

        for (const cliente of clientesDoUsuario) {

            const totalCobrancas = await knex('cobrancas')
                .where({ cliente_id: cliente.id })
                .sum('valor');

            cliente.cobrancasFeitas = (totalCobrancas[0].sum / 100).toLocaleString('pt-br', { minimumFractionDigits: 2 });
        }
        for (const cliente of clientesDoUsuario) {

            const pagamentosCobrancas = await knex('cobrancas')
                .where({ cliente_id: cliente.id, status: 'PAGO' })
                .sum('valor');

            cliente.cobrancasPagas = (pagamentosCobrancas[0].sum / 100).toLocaleString('pt-br', { minimumFractionDigits: 2 });
        }
        for (const cliente of clientesDoUsuario) {

            const cobrancasVencidas = await knex('cobrancas')
                .where({ cliente_id: cliente.id })
                .andWhere('vencimento', '<', new Date());

            if (cobrancasVencidas.length > 0) {
                cliente.status = 'INADIMPLENTE'
            } else {
                cliente.status = 'EM DIA'
            }
        }
        const clientesEmDia = clientesDoUsuario.filter((cliente) => cliente.status === 'EM DIA').length;
        const clientesInadimplentes = clientesDoUsuario.filter((cliente) => cliente.status === 'INADIMPLENTE').length;

        return res.status(200).json({ clientesDoUsuario, clientesEmDia, clientesInadimplentes });

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

        const cobrancasCliente = await knex('cobrancas').where({
            cliente_id: id
        })

        for (const cobranca of cobrancasCliente) {
            cobranca.valor = (cobranca.valor / 100).toLocaleString('pt-br', { minimumFractionDigits: 2 })
            cobranca.vencimento = format(cobranca.vencimento, 'dd/MM/yyyy')
        }

        cliente.cobrancas = cobrancasCliente;

        return res.status(200).json(cliente);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}
const editarCliente = async (req, res) => {
    const { nome, email, telefone, cpf, cep, logradouro, complemento, bairro, cidade, estado, referencia } = req.body;
    const { id } = req.params;

    if (!nome && !email && !telefone && !cpf && !cep && !logradouro && !complemento && !bairro && !cidade && !estado && !referencia) {
        return res.status(400).json('Você deve informar ao menos um campo para editar o cliente');
    }

    try {
        const clienteExiste = await knex('clientes').where({
            id,
            usuario_id: req.usuario.id
        }).first();

        if (!clienteExiste) {
            return res.status(404).json('Cliente não encontrado ou não está vinculado ao usuario logado!');
        }

        if (cpf && cpf !== clienteExiste.cpf) {

            const cpfClienteExiste = await knex('clientes').where({
                cpf,
                usuario_id: req.usuario.id
            }).first();

            if (cpfClienteExiste) {
                return res.status(400).json('Você já possui um cliente com o cpf informado.');
            }
        }
        if (email && email !== clienteExiste.email) {

            const emailClienteExiste = await knex('clientes').where({
                email,
                usuario_id: req.usuario.id
            }).first();

            if (emailClienteExiste) {
                return res.status(400).json('Você já possui um cliente com o email informado.');
            }
        }

        const clienteAtualizado = await knex('clientes')
            .where({
                id,
                usuario_id: req.usuario.id
            })
            .update({
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
                referencia
            });

        if (!clienteAtualizado) {
            return res.status(400).json("O cliente não foi atualizado");
        }

        const resposta = await knex('clientes').where({
            id,
            usuario_id: req.usuario.id
        }).first();

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