Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        console.log("helper called");
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
