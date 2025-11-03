import React from 'react';
import './KRAMetrics.css';

const KRAMetrics = ({dashboardData: propDashboardData}) => {
  // const kraData = [
  //   { type: 'Deposits', weight: 28 },
  //   { type: 'Advances', weight: 20 },
  //   { type: 'NPA & Recovery', weight: 10 },
  //   { type: 'Compliance', weight: 6 },
  //   { type: 'Digital', weight: 5 },
  //   { type: 'Income', weight: 4 },
  //   { type: 'Total', weight: 80, isTotal: true }
  // ];

  const kraData = propDashboardData.kraTypeData;

  // const kraDetails = [
  //   {
  //     title: 'Amount of recovery and upgradation in accounts tagged as NPA vs target',
  //     weight: 7
  //   },
  //   {
  //     title: '% Achievement digital banking activation (Debit Card, Credit Card, mbanking, internet banking, POS, UPI, RTGS)',
  //     weight: 5
  //   },
  //   {
  //     title: '% increase in CASA Balance from mapped customer for the branch against Target',
  //     weight: 5
  //   },
  //   {
  //     title: 'Amount of Fresh Slippages',
  //     weight: 4
  //   }
  // ];
  const kraDetails = propDashboardData.kraListDashBoard;

const totalCountKra = kraDetails?.reduce((acc, item) => {
  return acc + item.KRA_WEIGHT;
}, 0);

const totalKraType = kraData?.reduce((acc, item) => {
  return acc + (item.WEIGHT_SUM || 0);
}, 0);

  return (
    <div className="kra-metrics bg-white shadow-sm">
      <h2 className='text-primary'>My KRAs</h2>
      
      <div className='row g-5'>
        <div className='col-md-4 col-12 mb-4 mb-md-0 border-end'>
          <div className='row g-0'>
            <div className='col-10'><p className='fw-bold m-0'>KRA Type</p></div>
            <div className='col-2'><p className='fw-bold m-0 text-center'>Wgt</p></div>
          </div>
          <div className='kra-list mt-3'>
            {kraData.map((item, index) => (
              <div key={index} className={`row my-3 g-0 ${item.isTotal ? 'total-row' : ''}`}>
                <div className='col-10'><p className='m-0'>{item.TYPE}</p></div>
                <div className='col-2'><p className='m-0 text-center'>{item.WEIGHT_SUM}</p></div>
              </div>
            ))}
          </div>
           <div className='row text-primary mt-2 g-0'>
            <div className='col-10'><p className='fw-bold m-0 '>Total</p></div>
            <div className='col-2'>
              <p className='fw-bold m-0 text-center'>
                {totalKraType || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='col-md-8 col-12'>
          <div className='row g-0'>
            <div className='col-10'><p className='fw-bold m-0'>KRAs</p></div>
            <div className='col-2'><p className='fw-bold m-0 text-center'>Wgt</p></div>
          </div>
          <div className='kra-list mt-3'>
            {kraDetails.map((item, index) => (
              <div key={index} className={`row my-3`}>
                <div className='col-10'><p className='m-0'>{item.KRA_NAME}</p></div>
                <div className='col-2'><p className='m-0 text-center'>{item.KRA_WEIGHT}</p></div>
              </div>
            ))}
          </div>
          <div className='row text-primary mt-2 g-0'>
            <div className='col-10'><p className='fw-bold m-0 '>Total</p></div>
            <div className='col-2'>
              <p className='fw-bold m-0 text-center'>
                {/* {kraDetails.reduce((sum, item) => sum + Number(item.KRA_WEIGHT), 0)} */}
                {totalCountKra || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KRAMetrics;