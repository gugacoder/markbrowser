// Esquema do arquivo de configuração users.json
// Segundo o padrão de esquema da biblioteca isvalid'
//   https: //www.npmjs.com/package/isvalid

var schema = {
  'users': {
    type: Array,
    required: true,
    errors: {
      type: '/users deve ser uma array',
      required: '/users é requerido'
    },
    schema: {
      'username': {
        type: String,
        required: true,
        match: /^[a-z0-9-.]*$/,
        errors: {
          type: '/users/username deve ser uma string',
          match: '/users/username deve conter apenas letras minúsculas, números, hífens e pontos',
          required: '/users/username é requerido'
        }
      },
      'name': {
        type: String,
        required: true,
        errors: {
          type: '/users/name deve ser uma string',
          required: '/users/name é requerido'
        }
      },
      'password': {
        type: String,
        required: false,
        errors: {
          type: '/users/password deve ser uma string'
        }
      },
      'role': {
        type: String,
        required: true,
        enum: ['user','editor','admin'],
        errors: {
          type: '/users/role deve ser um dos valores: user, editor ou admin',
          required: '/users/role é requerido'
        }
      },
      'homepage': {
        type: String,
        required: false,
        errors: {
          type: '/users/homepage deve ser o caminho relativo da página inicial do usuário'
        }
      }
    }
  }
};

module.exports = schema;
