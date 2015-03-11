/**
 * Created by Administrator on 1/14/2015.
 */
$.add("bl/core/when", ["bl/core/kernel", "bl/core/deferred", "bl/extensions/array"], function(kernel, Deferred){
   //deferred list

    function _exec(a, done, fail){
        if(a instanceof Deferred){
            a.then(done, fail);
        }else{
            done(a);
        }
    }
    /**
     * Take one(multiple) promise(s) and return a new promise
     * when all promisees
     */
    var when = function(/*..*/){
        try{
            var arity = arguments.length, args;
            if(arity == 1){
                args = arguments[0];
            }else{
                args = arguments;
            }
            args = kernel.makeArray(args);
            var def = new Deferred(), waitCount = args.length, rs;
            if(!waitCount) {
                return def.resolve([]);
            }
            rs = [];
            //
            args.forEach(function(v, i){
                _exec(v, function(data){
                    if(!def.isFulfilled()){
                        rs[i] = data;
                        if(--waitCount === 0){
                            def.resolve(rs);
                        }
                    }
                }, def.reject);
            });
            return def.promise;
        }catch (e){
            throw  e;
        }

    };

    return when;
});