const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const clientes = require('./controladores/clientes');
const filtroLogin = require('./filtros/filtroLogin');

const rotas = express();

// cadastro de usuario
rotas.post('/usuarios', usuarios.cadastrarUsuario);

// login
rotas.post('/login', login.logar);

// filtro de autenticação
rotas.use(filtroLogin);

// obter e atualizar perfil do usuario logado
rotas.get('/perfil', usuarios.obterPerfil);
rotas.put('/perfil', usuarios.atualizarPerfil);

// cadastrar e obter clientes
rotas.post('/clientes', clientes.cadastrarCliente);
rotas.get('/clientes', clientes.obterClientes);

module.exports = rotas;