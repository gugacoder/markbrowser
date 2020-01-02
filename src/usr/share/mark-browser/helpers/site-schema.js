// Esquema do arquivo de configuração site.json
// Segundo o padrão de esquema da biblioteca 'isvalid'
//   https://www.npmjs.com/package/isvalid

var schema = {

  'name': {
    type: String,
    required: false,
    errors: {
      type: '/site/name deve ser uma string em minúsculo'
    }
  },
  'title': {
    type: String,
    required: true,
    errors: {
      type: '/site/title deve ser uma string',
      required: '/site/title é requerido'
    }
  },
  'prefix': {
    type: String,
    required: true,
    errors: {
      type: '/site/prefix deve ser uma string'
    }
  },
  'description': {
    type: String,
    required: true,
    errors: {
      type: '/site/description deve ser uma string que descreva o site em detalhe',
      required: '/site/description é requerido'
    }
  },
  'copyright': {
    type: String,
    required: false,
    errors: {
      type: '/site/copyright texto de cópia legal.'
    }
  },

  'filesystem': {
    'homepage': {
      type: String,
      required: true,
      errors: {
        type: '/site/filesystem/homepage deve ser o nome da página de índice do site.'
      }
    }
  },

  'auth': {
    'ldap': {
      type: Boolean,
      required: false,
      errors: {
        type: '/site/auth/ldap deve ser um booliano.'
      }
    },
    'ldapSettings': {
      'url': {
        type: String,
        required: true,
        errors: {
          type: '/site/auth/ldapSettings/url deve ser uma URI como ldap://host.com',
          required: '/auth/ldapSettings/url é requerido'
        }
      },
      'baseDN': {
        type: String,
        required: true,
        errors: {
          type: '/site/auth/ldapSettings/baseDN deve ser um grupo de usuários LDAP como OU=Users,DC=Host,DC=com',
          required: '/auth/ldapSettings/baseDN é requerido'
        }
      },
      'username': {
        type: String,
        required: true,
        errors: {
          type: '/site/auth/ldapSettings/username deve ser uma string',
          required: '/auth/ldapSettings/username é requerido'
        }
      },
      'password': {
        type: String,
        required: true,
        errors: {
          type: '/site/auth/ldapSettings/password deve ser uma string',
          required: '/auth/ldapSettings/password é requerido'
        }
      }
    }
  },

  'spaces': {
    type: Array,
    required: true,
    errors: {
      type: '/site/spaces deve ser uma array',
      required: '/site/spaces é requerido'
    },
    schema: {
      'name': {
        type: String,
        required: true,
        errors: {
          type: '/site/spaces/name deve ser uma string',
          required: '/site/spaces/name é requerido'
        }
      },
      'title': {
        type: String,
        required: true,
        errors: {
          type: '/site/spaces/title deve ser uma string',
          required: '/site/spaces/title é requerido'
        }
      },
      'homepage': {
        type: String,
        required: true,
        errors: {
          type: '/site/spaces/homepage página inicial do espaço'
        }
      },
      'icon': {
        type: String,
        required: false,
        errors: {
          type: '/site/spaces/icon deve ser um nome de ícone do pingendo'
        }
      },
      'pinned': {
        type: Boolean,
        required: false,
        errors: {
          type: '/site/spaces/pinned deve ser true ou false'
        }
      }
    }

  }
};

module.exports = schema;
