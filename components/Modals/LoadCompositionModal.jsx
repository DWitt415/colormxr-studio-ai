import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import supabase from '@/utils/supabase'

function LoadCompositionModal({ isOpen, closeModal }) {
  const [series, setSeries] = useState([]);
  const [singles, setSingles] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('singles');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [seriesItems, setSeriesItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'items'

  // Fetch series and singles on open
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch series
        const { data: seriesData, error: seriesError } = await supabase
          .from('series_gallery')
          .select('*')
          .eq('type', 'composition')
          .order('created_at', { ascending: false });

        if (seriesError) throw seriesError;

        // Fetch singles (items without series)
        const { data: singlesData, error: singlesError } = await supabase
          .from('shapeset_gallery')
          .select('*')
          .is('series_id', null)
          .order('created_at', { ascending: false });

        if (singlesError) throw singlesError;

        setSeries(seriesData || []);
        setSingles(singlesData || []);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load compositions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchData();
      setViewMode('list');
      setSelectedItemId(null);
    }
  }, [isOpen]);

  // Fetch items in selected series
  const handleSelectSeries = async (seriesId) => {
    if (seriesId === 'singles') {
      setSelectedSeriesId('singles');
      setViewMode('items');
      setSeriesItems(singles);
    } else {
      setSelectedSeriesId(seriesId);
      setViewMode('items');

      try {
        const { data, error } = await supabase
          .from('shapeset_gallery')
          .select('*')
          .eq('series_id', seriesId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSeriesItems(data || []);
      } catch (err) {
        console.error('Error loading series items:', err);
        setError(`Failed to load series items: ${err.message}`);
      }
    }
  };

  // Handle item selection and load into creator
  const handleSelectItem = (item) => {
    console.log('🎨 Loading composition:', item);

    // Store the item data in localStorage
    if (typeof window !== 'undefined') {
      const dataToStore = {
        shapeColors: item.shape_colors || [],
        backgroundColor: item.background_color || 'rgb(255,255,255)',
        id: item.id
      };

      localStorage.setItem('editingShapeset', JSON.stringify(dataToStore));

      // Build URL parameters - use defaults since we don't store layout info
      const params = new URLSearchParams();
      params.append('layoutMode', 'grid');
      params.append('row', '5');
      params.append('col', '5');

      // Navigate to shapeset creator
      window.location.href = `/shapeset-creator?${params.toString()}`;
    }
  };

  // Go back to list view
  const handleBack = () => {
    setViewMode('list');
    setSeriesItems([]);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={closeModal}>
        <div className="fixed inset-0 z-30 w-screen bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-[#4A4A4A] p-6 shadow-xl transition-all text-bodytext">
                <div className="mb-4 text-left">
                  <h3 className="text-lg font-medium text-[#5670F8] leading-6">
                    Load Color Composition
                  </h3>
                </div>

                {error && (
                  <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                    </div>
                  ) : viewMode === 'list' ? (
                    <div className="max-h-60 overflow-y-auto scrollbar-dark">
                      <div className="space-y-0">
                        {/* Singles option */}
                        <div
                          className="p-3 cursor-pointer transition-colors text-left hover:bg-gray-700"
                          style={{ borderBottom: '0.5px solid #808080' }}
                          onClick={() => handleSelectSeries('singles')}
                        >
                          <div className="font-medium text-[#C8C8C8]">Singles</div>
                        </div>

                        {/* Series list */}
                        {series.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 cursor-pointer transition-colors text-left hover:bg-gray-700"
                            style={{ borderBottom: '0.5px solid #808080' }}
                            onClick={() => handleSelectSeries(item.id)}
                          >
                            <div className="font-medium text-[#C8C8C8]">{item.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto scrollbar-dark">
                      <div className="space-y-0">
                        {seriesItems.length === 0 ? (
                          <div className="p-4 text-left text-gray-400">
                            No compositions found
                          </div>
                        ) : (
                          seriesItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 cursor-pointer transition-colors text-left hover:bg-gray-700"
                              style={{ borderBottom: '0.5px solid #808080' }}
                              onClick={() => handleSelectItem(item)}
                            >
                              <div className="font-medium text-[#C8C8C8]">
                                {item.filename || `Composition ${item.id}`}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 gap-3">
                  {viewMode === 'items' ? (
                    <>
                      <button
                        type="button"
                        className="py-2 px-4 text-gray-400 hover:text-white rounded"
                        onClick={handleBack}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="py-2 px-4 text-gray-400 hover:text-white rounded"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="py-2 px-4 text-gray-400 hover:text-white rounded"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default LoadCompositionModal;
