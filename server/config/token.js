import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign({ id }, "MY_SECRET_KEY", {
    expiresIn: "7d",
  });
};
