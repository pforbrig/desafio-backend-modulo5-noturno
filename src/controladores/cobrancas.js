const knex = require('../conexao');
const { format } = require('date-fns');
const schemaCadastroCobranca = require('../validacoes/schemaCadastroCobranca');

const cadastrarCobranca = async (req, res) => {
    const { cliente_id, descricao, status, valor, vencimento } = req.body;

    try {
        //await schemaCadastroCobranca.validate(req.body);
        const adicionarCobranca = await knex('cobrancas').insert({
            cliente_id,
            usuario_id: req.usuario.id,
            descricao,
            status,
            valor: (valor.slice(2).replace(',', '')),
            vencimento
        }).returning('*');

        if (!adicionarCobranca) {
            return res.status(400).json("Não foi possivel cadastrar essa cobrança.");

        }
        res.status(200).json(adicionarCobranca[0]);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const listarCobrancas = async (req, res) => {
    const { id } = req.usuario

    try {

        const cobrancasDoUsuario = await knex('cobrancas')
            .join('clientes', 'cliente_id', 'clientes.id')
            .select('cobrancas.id', 'clientes.nome', 'cobrancas.descricao', 'cobrancas.valor', 'cobrancas.vencimento', 'cobrancas.status')
            .where({ 'cobrancas.usuario_id': id });

        if (!cobrancasDoUsuario) {
            return res.status(400).json("Não foi possivel buscar as cobrancas.");
        }

        for (const cobranca of cobrancasDoUsuario) {
            cobranca.valor = (cobranca.valor / 100).toLocaleString('pt-br', { minimumFractionDigits: 2 });

            if (cobranca.status === 'PENDENTE') {
                if (+cobranca.vencimento < new Date()) {
                    cobranca.status = 'VENCIDA'
                }
            }

            cobranca.vencimento = format(cobranca.vencimento, 'dd/MM/yyyy');

        }

        const cobrancasPendentes = cobrancasDoUsuario.filter((cobranca) => cobranca.status === 'PENDENTE').length;
        const cobrancasVencidas = cobrancasDoUsuario.filter((cobranca) => cobranca.status === 'VENCIDA').length;
        const cobrancasPagas = cobrancasDoUsuario.filter((cobranca) => cobranca.status === 'PAGO').length;

        res.status(200).json({ cobrancasDoUsuario, cobrancasPendentes, cobrancasVencidas, cobrancasPagas });

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirCobranca = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const cobrancaEncontrada = await knex('cobrancas').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!cobrancaEncontrada) {
            return res.status(404).json('Cobranca não encontrada!');
        }

        const cobrancaExcluida = await knex('cobrancas').where({
            id,
            usuario_id: usuario.id
        }).del();

        if (!cobrancaExcluida) {
            return res.status(400).json("Erro ao excluir a cobrança!");
        }

        return res.status(200).json('Cobrança excluída com sucesso!');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const editarCobranca = async (req, res) => {
    const { descricao, status, valor, vencimento } = req.body;
    const { id } = req.params;

    if (!descricao && !status && !valor && !vencimento) {
        return res.status(400).json('Você deve informar ao menos um campo para editar a cobrança!');
    }

    try {
        const cobrancaExiste = await knex('cobrancas').where({
            id,
            usuario_id: req.usuario.id
        }).first();

        if (!cobrancaExiste) {
            return res.status(404).json('Cobrança não encontrada ou não está vinculado ao usuario logado!');
        }

        const cobrancaAtualizada = await knex('cobranca')
            .where({
                id,
                usuario_id: req.usuario.id
            })
            .update({
                descricao,
                status,
                valor,
                vencimento
            });

        if (!cobrancaAtualizada) {
            return res.status(400).json("Erro ao atualizar a cobrança!");
        }

        const resposta = await knex('cobrancas').where({
            id,
            usuario_id: req.usuario.id
        }).first();

        return res.status(200).json(resposta);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

module.exports = {
    cadastrarCobranca,
    listarCobrancas,
    excluirCobranca,
    editarCobranca
};