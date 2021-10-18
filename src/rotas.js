const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const clientes = require('./controladores/clientes');
const cobrancas = require('./controladores/cobrancas');
const filtroLogin = require('./filtros/filtroLogin');
const filtroCampoVazio = require('./filtros/filtroCampoVazio');

const rotas = express();


// cadastro de usuario
rotas.post('/usuarios', usuarios.cadastrarUsuario);

// login
rotas.post('/login', login.logar);

// filtros
rotas.use(filtroLogin);
rotas.use(filtroCampoVazio);

// obter e atualizar perfil do usuario logado
rotas.get('/perfil', usuarios.obterPerfil);
rotas.put('/perfil', usuarios.editarPerfil);

// clientes
rotas.post('/clientes', clientes.cadastrarCliente);
rotas.get('/clientes', clientes.listarClientes);
rotas.get('/clientes/:id', clientes.obterCliente);
rotas.put('/clientes/:id', clientes.editarCliente);

// cobrancas
rotas.post('/cobrancas', cobrancas.cadastrarCobranca);
rotas.get('/cobrancas', cobrancas.listarCobrancas);
rotas.get('/cobrancas/:id', cobrancas.obterCobranca);
rotas.put('/cobrancas/:id', cobrancas.editarCobranca);
rotas.delete('/cobrancas/:id', cobrancas.excluirCobranca);

module.exports = rotas;