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
            valor: (valor.slice(2, -3) * 100),
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

module.exports = {
    cadastrarCobranca,
    listarCobrancas
};