var utils = require("../../utils/utils.js");
var checkURLParam = utils.checkURLParam;

module.exports.GET = async function(req, write, server, ctx) {
	var path = ctx.path;

	var url = server.url;
	var db = server.db;
	var dispage = server.dispage;
	var accountSystem = server.accountSystem;

	if(accountSystem == "uvias") {
		return;
	}

	// gets id from /accounts/verify/{key}/
	var verification_key = checkURLParam("/accounts/verify/:key", path).key;

	if(verification_key == "complete") {
		return await dispage("activate_complete", null, req, write, server, ctx);
	}

	var user_verify = await db.get("SELECT * FROM registration_registrationprofile WHERE activation_key=?", verification_key);

	if(!user_verify) {
		return await dispage("register_failed", null, req, write, server, ctx);
	}
	var user_id = user_verify.user_id;
	await db.run("UPDATE auth_user SET is_active=1 WHERE id=?", user_id);
	await db.run("DELETE FROM registration_registrationprofile WHERE user_id=?", user_id);

	write(null, null, {
		redirect: "/accounts/verify/complete/"
	});
}