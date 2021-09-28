drop table if exists usuarios;

drop table if exists clientes;

create table usuarios (
	id serial primary key,
  	nome text not null,
  	email text not null unique,
  	senha text not null,
    cpf text,
    telefone text
);

create table clientes (
	id serial primary key,
  usuario_id integer not null,
  	nome text not null,
  	email text not null unique,
  	telefone text not null,
    cpf text not null,
    cep text,
    logradouro text,
    complemento text,
    bairro text,
    cidade text,
    estado text,
    foreign key (usuario_id) references usuarios (id)
);