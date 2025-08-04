

const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ erro: "Erro interno do servidor" });
};

export default errorHandler;
