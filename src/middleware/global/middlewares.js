


module.exports = {
    setJgAuthToken:(req, res, next) => {
        const { e } = req.query;
        console.log('Trigger: 0 :',e);
        if(!e)return res.redirect('/err/noAuth');
        next();
        // if (req.query&&access_token) {
        //   req.authentication = {
        //     strategy: 'jwt',
        //     accessToken: access_token
        //   }
        //   next();
        // } else {
        //   return res.status(401).send('沒有權限參數');
        // }
    },

}