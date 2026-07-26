const User = require("../models/User");

const validateRoles = async (idA, roleA, idB, roleB) => {
  const [a, b] = await Promise.all([User.findById(idA), User.findById(idB)]);
  if (!a || a.role !== roleA) throw new Error(`${roleA} not found`);
  if (!b || b.role !== roleB) throw new Error(`${roleB} not found`);
  return { a, b };
};

// @route  PATCH /api/admin/link/parent-child
// @body   { parentId, studentId }
const linkParentChild = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;
    const { a: parent, b: student } = await validateRoles(parentId, "parent", studentId, "student");

    if (!parent.children.includes(studentId)) parent.children.push(studentId);
    student.parent = parentId;

    await Promise.all([parent.save(), student.save()]);
    res.json({ message: "Parent linked to child successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route  PATCH /api/admin/link/parent-child/remove
const unlinkParentChild = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;
    const { a: parent, b: student } = await validateRoles(parentId, "parent", studentId, "student");

    parent.children = parent.children.filter((id) => id.toString() !== studentId);
    if (student.parent?.toString() === parentId) student.parent = undefined;

    await Promise.all([parent.save(), student.save()]);
    res.json({ message: "Link removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route  PATCH /api/admin/link/tutor-student
// @body   { tutorId, studentId }
const linkTutorStudent = async (req, res) => {
  try {
    const { tutorId, studentId } = req.body;
    const { a: tutor, b: student } = await validateRoles(tutorId, "tutor", studentId, "student");

    if (!tutor.assignedStudents.includes(studentId)) tutor.assignedStudents.push(studentId);
    if (!student.assignedTutors.includes(tutorId)) student.assignedTutors.push(tutorId);

    await Promise.all([tutor.save(), student.save()]);
    res.json({ message: "Tutor linked to student successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route  PATCH /api/admin/link/tutor-student/remove
const unlinkTutorStudent = async (req, res) => {
  try {
    const { tutorId, studentId } = req.body;
    const { a: tutor, b: student } = await validateRoles(tutorId, "tutor", studentId, "student");

    tutor.assignedStudents = tutor.assignedStudents.filter((id) => id.toString() !== studentId);
    student.assignedTutors = student.assignedTutors.filter((id) => id.toString() !== tutorId);

    await Promise.all([tutor.save(), student.save()]);
    res.json({ message: "Link removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route  GET /api/admin/link/overview
// @desc   Full picture for the admin linking screen: every parent + their children,
// every tutor + their students, and every student's own contact info.
const getLinkingOverview = async (req, res) => {
  try {
    const [parents, tutors, students] = await Promise.all([
      User.find({ role: "parent", status: "approved" }).populate("children", "name email phone studentClass"),
      User.find({ role: "tutor", status: "approved" }).populate("assignedStudents", "name email phone studentClass"),
      User.find({ role: "student", status: "approved" }).select("name email phone studentClass"),
    ]);
    res.json({ parents, tutors, students });
  } catch (error) {
    res.status(500).json({ message: "Failed to load linking data", error: error.message });
  }
};

module.exports = {
  linkParentChild,
  unlinkParentChild,
  linkTutorStudent,
  unlinkTutorStudent,
  getLinkingOverview,
};
