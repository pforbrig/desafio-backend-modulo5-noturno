const yup = require('./configuracoes');

const schemaCadastroCliente = yup.object().shape({
    nome: yup.string().required(),
    email: yup.string().required().email(),
    telefone: yup.string().required(),
    cpf: yup.string().required(),
});

module.exports = schemaCadastroCliente;