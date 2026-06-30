import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const GISMap = () => {
  const [permits, setPermits] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGISData = async () => {
      try {
        const [permitsRes, complaintsRes, roadsRes] = await Promise.all([
          axios.get('/api/permits'),
          axios.get('/api/complaints'),
          axios.get('/api/analytics').then(() => ({
            data: {
              success: true,
              data: [
                {
                  _id: 'road1',
                  name: 'Link Road No. 1',
                  ward: 'Ward 45 (MP Nagar)',
                  status: 'Closed',
                  closureReason: 'Telecom fiber laying project in progress.',
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [77.4, 23.25],
                      [77.405, 23.252],
                      [77.41, 23.255],
                    ],
                  },
                },
                {
                  _id: 'road2',
                  name: 'Hoshangabad Road',
                  ward: 'Ward 52 (Habibganj)',
                  status: 'Open',
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [77.42, 23.23],
                      [77.425, 23.232],
                      [77.43, 23.235],
                    ],
                  },
                },
              ],
            },
          })),
        ]);

        if (permitsRes.data.success) setPermits(permitsRes.data.data);
        if (complaintsRes.data.success) setComplaints(complaintsRes.data.data);
        if (roadsRes.data.success) setRoads(roadsRes.data.data);
      } catch (err) {
        console.error('Error fetching GIS map layers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGISData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="GIS Coordination"
        breadcrumb="Utility Map"
        title="Town Utility Map"
        subtitle="Explore excavation buffers, active projects, and citizen complaints across the city in real time."
      />

      <div style={{ height: '70vh', minHeight: '420px' }}>
        {loading ? (
          <div className="glass-panel flex h-full flex-col items-center justify-center gap-3 rounded-2xl">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-400">Loading map layers...</p>
          </div>
        ) : (
          <MapComponent permits={permits} complaints={complaints} roads={roads} />
        )}
      </div>
    </div>
  );
};

export default GISMap;
