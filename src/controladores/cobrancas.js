const knex = require('../conexao');
const schemaCadastroCobranca = require('../validacoes/schemaCadastroCobranca');

const cadastrarCobranca = async (req, res) => {
    const { nome, descricao, status, valor, vencimento, usuario_id } = req.body;
    //const { usuario_id } = req.usuario;

    try {
        //await schemaCadastroCobranca.validate(req.body);
        const buscaId = await knex('clientes').where({ nome, usuario_id }).first();
        const { id } = buscaId;
        const adicionarCobranca = await knex('cobrancas').insert({
            cliente_id: id,
            usuario_id,
            descricao,
            status,
            valor,
            vencimento
        }).returning('*');

        if(!adicionarCobranca){
            return res.status(400).json("Não foi possivel cadastrar essa cobrança.");

        }
        res.status(201).json(adicionarCobranca[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const listarCobrancas = async (req, res) => {
    const  usuario_id  = req.params.usuario_id;

    try {
        const query = 'select cobrancas.id, clientes.nome, cobrancas.descricao, cobrancas.valor, cobrancas.vencimento, cobrancas.status from cobrancas left join clientes on cobrancas.cliente_id = clientes.id where cobrancas.usuario_id = ?';
        const buscaCobrancas = await knex.raw(query, [usuario_id])

        if(!buscaCobrancas){
            return res.status(400).json("Não foi possivel buscar as cobrancas.");
        }

        res.status(200).json(buscaCobrancas.rows);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports ={ cadastrarCobranca, listarCobrancas};