const knex = require('../conexao');
const { format } = require('date-fns')
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
            valor,
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
            .select('cobrancas.id', 'clientes.nome', 'cobrancas.descricao', 'cobrancas.valor', 'cobrancas.vencimento')
            .where({ 'cobrancas.usuario_id': id });

        if (!cobrancasDoUsuario) {
            return res.status(400).json("Não foi possivel buscar as cobrancas.");
        }

        for (const cobranca of cobrancasDoUsuario) {
            cobranca.status = 'PENDENTE'
            if (+cobranca.vencimento < new Date()) {
                cobranca.status = 'VENCIDA'
            }
            cobranca.vencimento = format(cobranca.vencimento, 'dd/MM/yyyy')
        }

        cobrancasDoUsuario.pendentes = cobrancasDoUsuario.filter((cobranca) => cobranca.status === 'PENDENTE').length;
        cobrancasDoUsuario.vencidas = cobrancasDoUsuario.filter((cobranca) => cobranca.status === 'VENCIDAS').length;

        res.status(200).json(cobrancasDoUsuario);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    cadastrarCobranca,
    listarCobrancas
};