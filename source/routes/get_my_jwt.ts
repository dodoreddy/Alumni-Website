import express, {Request, Response, NextFunction, Router} from "express";
import {States} from "../helper/states";
import {sign} from "jsonwebtoken";
import {parseJwt} from "../helper/jwt_funcs";
import parser from "tld-extract";

const SECRET_KEY: string = process.env.SECRET_KEY || "";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
	next();
});

function isFromInventure(hd: string | undefined): boolean {
	if (hd && hd === "inventureacademy.com") {
		return true;
	}

	return false;
}

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
	if (States.has(req.params.id)) {
		States.remove(req.params.id);

		const role: string = req.params.role || "student";

		let ggl_jwt_payload = parseJwt(req.cookies.JWT_from_ggl);

		console.log(ggl_jwt_payload["hd"]);

		let my_JWT = sign(
			{
				email: ggl_jwt_payload.email,
				given_name: ggl_jwt_payload.given_name,
				family_name: ggl_jwt_payload.family_name,
				isInventureEmail: isFromInventure(ggl_jwt_payload.hd),
				role: role,
			},
			SECRET_KEY,
			{algorithm: "HS256", expiresIn: "31d"}
		);
		res.cookie("my_JWT", my_JWT, {
			maxAge: 10 * 60 * 1000,
			httpOnly: true,
		});
	}

	res.redirect(req.params.redirect_url || "/");
});
module.exports = router;
