const getRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await Record.find({ doctorId }).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
