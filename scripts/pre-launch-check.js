const fs = require('fs');
const MedicalSystemHealthCheck = require('./health-check');

async function generateHealthReport(report) {
  fs.writeFileSync('health-report.json', JSON.stringify(report, null, 2));
}

const validateBeforeLaunch = async () => {
  console.log('🏥 [HEALTH] Starting SYMFARMIA medical system validation...');

  const validator = new MedicalSystemHealthCheck();
  const healthReport = await validator.validateAllSystems();

  await generateHealthReport(healthReport);

  if (healthReport.criticalFailures.length > 0) {
    console.error('❌ [CRITICAL] Cannot launch - critical medical systems failed:');
    healthReport.criticalFailures.forEach(failure => {
      console.error(`   - ${failure.error}`);
    });
    process.exit(1);
  }

  if (healthReport.overall === 'degraded') {
    console.warn('⚠️ [WARNING] Some non-critical systems have issues');
  }

  console.log('✅ [HEALTH] All critical medical systems operational');
  console.log('🚀 [LAUNCH] SYMFARMIA ready for medical use');

  return healthReport;
};

if (require.main === module) {
  validateBeforeLaunch().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = validateBeforeLaunch;
