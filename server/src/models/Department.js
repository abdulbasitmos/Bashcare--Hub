const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  head: { type: String, default: 'Unassigned' },
  staff: { type: Number, default: 0 },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
