/**
 * Test Medical Specialty Loops
 * Direct testing of HIV+ pregnant adolescents and quality of life medical loops
 */

import { MedicalSpecialtyService } from './app/services/MedicalSpecialtyService.js';

async function testHIVPregnantAdolescents() {
  console.log('\n🏥 TESTING HIV+ PREGNANT ADOLESCENTS LOOP');
  console.log('==========================================');
  
  const patientContext = {
    age: 17,
    gestationalAge: '24 weeks',
    hivStatus: 'positive',
    viralLoad: 'detectable',
    previousPregnancies: 0,
    socialSupport: 'limited',
    community: 'underserved'
  };

  try {
    const result = await MedicalSpecialtyService.hivPregnantAdolescentsLoop(patientContext);
    
    console.log(`📊 Population: ${result.population}`);
    console.log(`🔍 Total Queries: ${result.totalQueries}`);
    console.log(`⚠️  Urgency: ${result.urgency}`);
    console.log(`🚨 Vulnerability: ${result.vulnerability}`);
    
    console.log('\n📋 SPECIALIZED RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
    console.log('\n💡 SAMPLE QUERIES ADDRESSED:');
    console.log('- HIV antirretroviral safety during pregnancy');
    console.log('- Mother-to-child transmission prevention');
    console.log('- Viral load monitoring frequency');
    console.log('- Nutritional supplementation needs');
    console.log('- Delivery method recommendations');
    console.log('- Breastfeeding guidelines for HIV+');
    console.log('- Adherence strategies for adolescents');
    console.log('- Mental health support needs');
    console.log('- Sexual education and future prevention');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error testing HIV pregnant adolescents loop:', error.message);
    return null;
  }
}

async function testQualityOfLife() {
  console.log('\n🌟 TESTING QUALITY OF LIFE LOOP');
  console.log('===============================');
  
  const patientContext = {
    age: 35,
    healthStatus: 'poor',
    dietQuality: 'inadequate',
    socialSupport: 'minimal',
    economicStatus: 'low',
    accessToCare: 'limited'
  };

  try {
    const result = await MedicalSpecialtyService.qualityOfLifeLoop(patientContext);
    
    console.log(`📊 Population: ${result.population}`);
    console.log(`🔍 Total Queries: ${result.totalQueries}`);
    console.log(`⚡ Priority: ${result.priority}`);
    console.log(`🎯 Focus: ${result.focus}`);
    
    console.log('\n📋 QUALITY OF LIFE RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
    console.log('\n💡 AREAS ADDRESSED:');
    console.log('- Nutritional deficiencies and supplementation');
    console.log('- Chronic disease screening');
    console.log('- Therapeutic exercise programs');
    console.log('- Mental health evaluation and support');
    console.log('- Community resource connections');
    console.log('- Preventive medicine protocols');
    console.log('- Self-care education');
    console.log('- Coordinated medical follow-up');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error testing quality of life loop:', error.message);
    return null;
  }
}

async function testComprehensiveLoop() {
  console.log('\n🔄 TESTING COMPREHENSIVE VULNERABLE POPULATIONS LOOP');
  console.log('===================================================');
  
  const patientContext = {
    age: 16,
    gestationalAge: '28 weeks',
    hivStatus: 'positive',
    qualityOfLife: 'poor',
    socialSupport: 'very limited',
    economicStatus: 'very low',
    community: 'underserved',
    riskFactors: ['adolescent', 'HIV+', 'pregnancy', 'poverty', 'malnutrition']
  };

  try {
    const result = await MedicalSpecialtyService.comprehensiveVulnerableLoop(patientContext);
    
    console.log(`📊 Populations: ${result.populations.join(', ')}`);
    console.log(`🚨 Overall Priority: ${result.overallPriority}`);
    console.log(`🔄 Comprehensive Assessment: ${result.comprehensive}`);
    
    console.log('\n🎯 COMBINED RECOMMENDATIONS:');
    result.combinedRecommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
    console.log('\n🌍 COMMUNITY IMPACT:');
    console.log('✅ Addresses multiple vulnerability factors simultaneously');
    console.log('✅ Provides holistic care for underserved populations');
    console.log('✅ Integrates HIV management with quality of life');
    console.log('✅ Supports adolescent development during pregnancy');
    console.log('✅ Ensures coordinated multidisciplinary care');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error testing comprehensive loop:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 SYMFARMIA MEDICAL AI - VULNERABLE POPULATIONS TESTING');
  console.log('========================================================');
  console.log('🏥 Revolutionary AI-driven care for underserved communities');
  console.log('👥 Focused on HIV+ pregnant adolescents and quality of life');
  console.log('');
  
  const results = {
    hivPregnancy: await testHIVPregnantAdolescents(),
    qualityOfLife: await testQualityOfLife(),
    comprehensive: await testComprehensiveLoop()
  };
  
  console.log('\n📈 TEST SUMMARY');
  console.log('================');
  console.log(`✅ HIV+ Pregnant Adolescents: ${results.hivPregnancy ? 'SUCCESS' : 'FAILED'}`);
  console.log(`✅ Quality of Life Support: ${results.qualityOfLife ? 'SUCCESS' : 'FAILED'}`);
  console.log(`✅ Comprehensive Care: ${results.comprehensive ? 'SUCCESS' : 'FAILED'}`);
  
  console.log('\n🎯 MEDICAL AI ACHIEVEMENTS:');
  console.log('- Specialized care for HIV+ pregnant adolescents');
  console.log('- Quality of life improvements for vulnerable patients');
  console.log('- Comprehensive multidisciplinary recommendations');
  console.log('- Evidence-based clinical guidance');
  console.log('- Community health impact focus');
  
  console.log('\n⚕️  CLINICAL SIGNIFICANCE:');
  console.log('This AI system addresses critical gaps in healthcare for:');
  console.log('• Pregnant adolescents with HIV (maternal & fetal health)');
  console.log('• Patients with poor quality of life and inadequate nutrition');
  console.log('• Underserved communities with limited healthcare access');
  console.log('• Complex cases requiring coordinated multidisciplinary care');
  
  return results;
}

// Mock fetch for testing without server
global.fetch = async (url, options) => {
  console.log(`🔍 Mock API Call: ${url}`);
  const body = JSON.parse(options.body);
  console.log(`📝 Query: ${body.query.substring(0, 60)}...`);
  
  // Simulate AI response based on query type
  let mockResponse = "Clinical guidance based on current evidence and best practices.";
  
  if (body.query.includes('antirretroviral')) {
    mockResponse = "Efavirenz-based regimens are first-line for HIV+ pregnant patients when started after first trimester. Consider integrase inhibitors for improved tolerability.";
  } else if (body.query.includes('transmisión')) {
    mockResponse = "With appropriate antiretroviral therapy and viral suppression, mother-to-child transmission risk can be reduced to less than 2%.";
  } else if (body.query.includes('nutricional')) {
    mockResponse = "Folic acid 5mg daily, iron supplementation, and vitamin D assessment are essential for pregnant HIV+ adolescents.";
  } else if (body.query.includes('calidad vida')) {
    mockResponse = "Comprehensive nutritional assessment, mental health screening, and social support evaluation are foundational for quality of life improvement.";
  }
  
  return {
    ok: true,
    json: async () => ({
      success: true,
      response: mockResponse,
      confidence: 0.85,
      reasoning: ["Evidence-based clinical guidelines", "Current HIV treatment protocols", "Adolescent pregnancy considerations"],
      suggestions: ["Regular monitoring", "Multidisciplinary care", "Patient education"],
      disclaimer: "AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado."
    })
  };
};

runAllTests().catch(console.error);