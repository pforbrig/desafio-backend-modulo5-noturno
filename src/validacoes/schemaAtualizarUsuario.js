const yup = require('./configuracoes');

const schemaAtualizarUsuario = yup.object().shape({
    email: yup.string().email(),
});

module.exports = schemaAtualizarUsuario;