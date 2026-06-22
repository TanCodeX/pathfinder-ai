const { getATSAnalyses } = require('./actions/ats');
async function run() {
  try {
    await getATSAnalyses();
    console.log("SUCCESS");
  } catch(e) {
    console.error("ERROR", e);
  }
}
run();
