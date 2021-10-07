const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const clientes = require('./controladores/clientes');
const cobrancas = require('./controladores/cobrancas');
const filtroLogin = require('./filtros/filtroLogin');
const filtroCampoNulo = require('./filtros/filtroCampoNulo');

const rotas = express();


// cadastro de usuario
rotas.post('/usuarios', usuarios.cadastrarUsuario);

// login
rotas.post('/login', login.logar);

// filtros
rotas.use(filtroLogin);
rotas.use(filtroCampoNulo);

// obter e atualizar perfil do usuario logado
rotas.get('/perfil', usuarios.obterPerfil);
rotas.put('/perfil', usuarios.editarPerfil);

// cadastrar e obter clientes
rotas.post('/clientes', clientes.cadastrarCliente);
rotas.get('/clientes', clientes.listarClientes);
rotas.get('/clientes/:id', clientes.obterCliente);
rotas.put('/clientes', clientes.editarCliente);

// cobrancas
rotas.post('/cobrancas', cobrancas.cadastrarCobranca);
rotas.get('/cobrancas', cobrancas.listarCobrancas);

module.exports = rotas;