const knex = require('../conexao');
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

    try {
        const query = `select cobrancas.id, clientes.nome, cobrancas.descricao, cobrancas.valor, cobrancas.vencimento, cobrancas.status from cobrancas left join clientes on cobrancas.cliente_id = clientes.id where cobrancas.usuario_id = ${req.usuario.id}`;
        const buscaCobrancas = await knex.raw(query, [req.usuario.id])

        if (!buscaCobrancas) {
            return res.status(400).json("Não foi possivel buscar as cobrancas.");
        }

        res.status(200).json(buscaCobrancas.rows);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    cadastrarCobranca,
    listarCobrancas
};