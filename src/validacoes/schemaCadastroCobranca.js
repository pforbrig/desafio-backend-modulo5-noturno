const yup = require('./configuracoes');

const schemaCadastroCobranca = yup.object().shape({
    nome: yup.string().required(),
    descricao: yup.string().required(),
    status: yup.boolean(),
    valor: yup.number().required(),
    vencimento: yup.date().required()
});

module.exports = schemaCadastroCobranca;