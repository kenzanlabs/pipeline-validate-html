module.exports = function () {
    'use strict';

    return {
        pipelines: {
            validateHtml: {
                files: [
                    '*.html'
                ]
            }
        }
    };
};
