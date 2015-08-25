/* exported require */
var require = {
    paths: {
        'jquery': 'lib/jquery-2.1.4',
        'jquery-private': 'lib/jquery-private',
        'knockout': 'lib/knockout-3.3.0.debug',
        'text': 'lib/text',
        'json2': 'lib/json2',
        'boostrap' : 'lib/bootstrap/js/bootstrap'
    },
    map: {
        '*': {
            'jquery': 'jquery-private'
        },
        'jquery-private': {
            'jquery': 'jquery'
        }
    },
    config: {
        'viewModels/Player': {
            photoUrlTemplate: '//int.scottlogic.co.uk/directory/photo/{id}.jpg'
        },
        'Service': {
            baseUrl: '/ladder/rest'
        },
        'viewModels/Chat': {
            baseUrl: 'ws://localhost:8080/ladder/chat'
        }
    }
};