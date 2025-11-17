// controllers/workerController.js

const Report = require("../models/Report");
const User = require("../models/User");

// -----------------------------------------------------
// 1️⃣ GET ASSIGNED REPORTS (Worker Panel)
// -----------------------------------------------------
exports.getAllWorkerReports = async (req, res) => {
  try {
    const workerId = req.user._id; // from auth middleware

    // Fetch all reports assigned to this worker
    const reports = await Report.find({
      assignedWorker: workerId
    })
      .sort({
        severity: -1,      // High → Low
        createdAt: -1      // newest first
      })
      .select("-__v")
      .populate("assignedWorker", "name email city"); // optional populate

    // -------- Worker Stats (For Dashboard) --------
    const stats = {
      total: reports.length,
      assigned: reports.filter(r => r.status === "Assigned").length,
      completed: reports.filter(r => r.status === "Completed").length,
      declined: reports.filter(r => r.status === "Declined").length
    };

    // Send both stats + reports to frontend
    res.json({
      stats,
      reports
    });

  } catch (error) {
    console.error("getAllWorkerReports Error:", error);
    res.status(500).json({ message: "Failed to fetch worker reports" });
  }
};


// -----------------------------------------------------
// 2️⃣ UPDATE REPORT STATUS (Completed / Declined)
// -----------------------------------------------------
exports.updateReportStatusByWorker = async (req, res) => {
  try {
    const workerId = req.user._id;
    const reportId = req.params.id;

    const { status, workerNotes } = req.body;
    const completionImage = req.fileUrl; // optional Cloudinary image

    if (!["Completed", "Declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the report
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only allow worker to modify HIS OWN report
    if (!report.assignedWorker || report.assignedWorker.toString() !== workerId.toString()) {
      return res.status(403).json({ message: "This report is not assigned to you" });
    }

    // Store old status
    const oldStatus = report.status;

    // Update status
    report.status = status;
    if (workerNotes) report.workerNotes = workerNotes;
    if (completionImage) report.imageUrl_after = completionImage;

    await report.save();

    // -----------------------------------------------------
    // UPDATE WORKER pendingTaskCount
    // -----------------------------------------------------
    if (oldStatus === "Assigned" && (status === "Completed" || status === "Declined")) {
      await User.findByIdAndUpdate(workerId, { $inc: { pendingTaskCount: -1 } });
    }

    res.json({
      message: "Report updated successfully",
      report
    });

  } catch (error) {
    console.error("updateReportStatusByWorker Error:", error);
    res.status(500).json({ message: "Failed to update report" });
  }
};
