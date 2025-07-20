import React, { useState } from "react";
import ReactDatamaps from "react-india-states-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the regional grids and their states
const REGIONAL_GRIDS = {
  northern: {
    name: "Northern Region",
    color: "#FCA5A5", // Light red
    hoverColor: "#DC2626", // Darker red for hover
    states: [
      "Delhi",
      "Haryana",
      "Himachal Pradesh",
      "Jammu & Kashmir",
      "Punjab",
      "Rajasthan",
      "Uttar Pradesh",
      "Uttarakhand",
      "Chandigarh",
      "Dadara & Nagar Haveli",
      "Daman & Diu",
    ],
  },
  eastern: {
    name: "Eastern Region",
    color: "#93C5FD", // Light blue
    hoverColor: "#2563EB", // Darker blue for hover
    states: ["Bihar", "Jharkhand", "Odisha", "West Bengal", "Sikkim"],
  },
  western: {
    name: "Western Region",
    color: "#C084FC", // Light purple
    hoverColor: "#7C3AED", // Darker purple for hover
    states: ["Chhattisgarh", "Gujarat", "Madhya Pradesh", "Maharashtra", "Goa"],
  },
  southern: {
    name: "Southern Region",
    color: "#86EFAC", // Light green
    hoverColor: "#059669", // Darker green for hover
    states: [
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Telangana",
      "Puducherry",
      "Andaman & Nicobar Island",
      "Lakshadweep",
    ],
  },
  northeastern: {
    name: "North Eastern Region",
    color: "#FDE68A", // Light yellow
    hoverColor: "#D97706", // Darker orange for hover
    states: [
      "Arunanchal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Tripura",
    ],
  },
};

// Sample data for regional stats (matching your reference image)
const REGIONAL_DATA = {
  "ALL INDIA": {
    totalCapacity: 475590,
    maxDemand: 250070,
    maxEnergy: 5466,
    capacityDate: "31-05-2025",
    demandDate: "30-05-2024",
    energyDate: "30-05-2024",
  },
  "NORTHERN REGION": {
    totalCapacity: 138808,
    maxDemand: 91215,
    maxEnergy: 2023,
    capacityDate: "31-05-2025",
    demandDate: "19-06-2024",
    energyDate: "12-06-2025",
  },
  "NORTH EASTERN REGION": {
    totalCapacity: 5551,
    maxDemand: 3939,
    maxEnergy: 80,
    capacityDate: "31-05-2025",
    demandDate: "13-06-2025",
    energyDate: "20-09-2024",
  },
  "WESTERN REGION": {
    totalCapacity: 159708,
    maxDemand: 80000,
    maxEnergy: 1742,
    capacityDate: "31-05-2025",
    demandDate: "08-02-2025",
    energyDate: "25-04-2025",
  },
  "EASTERN REGION": {
    totalCapacity: 36116,
    maxDemand: 33014,
    maxEnergy: 702,
    capacityDate: "31-05-2025",
    demandDate: "13-06-2025",
    energyDate: "14-06-2025",
  },
  "SOUTHERN REGION": {
    totalCapacity: 135247,
    maxDemand: 69942,
    maxEnergy: 1458,
    capacityDate: "31-05-2025",
    demandDate: "21-03-2024",
    energyDate: "28-03-2025",
  },
};

const Map: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL INDIA");
  const [activeState, setActiveState] = useState({
    data: { value: 0, color: "#E5E7EB" },
    name: "India",
  });
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Function to get the region for a given state
  const getStateRegion = (stateName: string) => {
    // Normalize the state name for comparison
    const normalizeStateName = (name: string) =>
      name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();

    const normalizedInputName = normalizeStateName(stateName);

    for (const [regionKey, regionData] of Object.entries(REGIONAL_GRIDS)) {
      if (
        regionData.states.some((state) => {
          const normalizedStateName = normalizeStateName(state);
          return (
            normalizedStateName === normalizedInputName ||
            normalizedStateName.includes(normalizedInputName) ||
            normalizedInputName.includes(normalizedStateName) ||
            // Direct match for exact library state names
            state === stateName
          );
        })
      ) {
        return regionKey;
      }
    }
    return "unknown";
  };

  // Function to get color for a state based on region
  const getRegionColor = (stateName: string) => {
    const region = getStateRegion(stateName);
    if (region === "unknown") return "#E5E7EB"; // Gray for unknown states

    const regionData = REGIONAL_GRIDS[region as keyof typeof REGIONAL_GRIDS];
    return regionData.color;
  };

  // Function to get hover color for a state based on region
  const getRegionHoverColor = (stateName: string) => {
    const region = getStateRegion(stateName);
    if (region === "unknown") return "#D1D5DB"; // Darker gray for unknown states

    const regionData = REGIONAL_GRIDS[region as keyof typeof REGIONAL_GRIDS];
    return regionData.hoverColor;
  };

  // Create the regionData object for ReactDatamaps
  const createRegionData = () => {
    const regionData: {
      [key: string]: { value: number; color: string; hoverColor?: string };
    } = {};

    // All valid state names for the library
    const validStates = [
      "Andaman & Nicobar Island",
      "Andhra Pradesh",
      "Arunanchal Pradesh",
      "Assam",
      "Bihar",
      "Chandigarh",
      "Chhattisgarh",
      "Dadara & Nagar Haveli",
      "Daman & Diu",
      "Delhi",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jammu & Kashmir",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Lakshadweep",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Puducherry",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
    ];

    validStates.forEach((state) => {
      regionData[state] = {
        value: 1,
        color: getRegionColor(state),
        hoverColor: getRegionHoverColor(state),
      };
    });

    return regionData;
  };

  const handleStateClick = (
    data: { value: number; color: string },
    name: string
  ) => {
    const region = getStateRegion(name);
    if (region !== "unknown") {
      const regionData = REGIONAL_GRIDS[region as keyof typeof REGIONAL_GRIDS];
      setSelectedRegion(regionData.name.toUpperCase());
    }
    setActiveState({ data, name });
  };

  const currentData =
    REGIONAL_DATA[selectedRegion as keyof typeof REGIONAL_DATA] ||
    REGIONAL_DATA["ALL INDIA"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
          India Energy Market Regional Map
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-center">Regional Grid Map</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-[50px]">
                <div className="relative w-full w-3xl">
                  <ReactDatamaps
                    regionData={createRegionData()}
                    mapLayout={{
                      hoverTitle: "Region",
                      noDataColor: "#E5E7EB",
                      borderColor: "#ffffff",
                      hoverBorderColor: hoveredState
                        ? getRegionHoverColor(hoveredState)
                        : "#000000",
                      hoverColor: hoveredState
                        ? getRegionHoverColor(hoveredState)
                        : "#4F46E5",
                    }}
                    hoverComponent={({
                      value,
                    }: {
                      value: { name: string };
                    }) => {
                      const region = getStateRegion(value.name);
                      const regionData =
                        region !== "unknown"
                          ? REGIONAL_GRIDS[
                              region as keyof typeof REGIONAL_GRIDS
                            ]
                          : null;

                      // Update hovered state for dynamic color
                      if (hoveredState !== value.name) {
                        setHoveredState(value.name);
                      }

                      return (
                        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border">
                          <p className="font-medium">{value.name}</p>
                          {regionData && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {regionData.name}
                            </p>
                          )}
                        </div>
                      );
                    }}
                    onClick={handleStateClick}
                    activeState={activeState}
                    onMouseEnter={(stateName: string) =>
                      setHoveredState(stateName)
                    }
                    onMouseLeave={() => setHoveredState(null)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Selected Region Stats */}
            <Card
              className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-all duration-300 ${
                hoveredState ? "ring-2 ring-blue-300 dark:ring-blue-600" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-center text-lg font-bold text-purple-600 dark:text-purple-400">
                  {selectedRegion}
                  {hoveredState && (
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      Hovering: {hoveredState} (
                      {getStateRegion(hoveredState) !== "unknown"
                        ? REGIONAL_GRIDS[
                            getStateRegion(
                              hoveredState
                            ) as keyof typeof REGIONAL_GRIDS
                          ].name
                        : "Unknown Region"}
                      )
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {currentData.totalCapacity.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      As On {currentData.capacityDate}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Installed Capacity (MW)
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {currentData.maxDemand.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      On {currentData.demandDate}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum Demand Met (MW)
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {currentData.maxEnergy.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      On {currentData.energyDate}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum Energy Met (MU)
                    </div>
                  </div>
                </div>

                {selectedRegion === "WESTERN REGION" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    As on 30-06-2025 based on operational data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regional Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-sm">
                  Regional Grid Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(REGIONAL_GRIDS).map(([key, region]) => {
                  const isCurrentRegion =
                    selectedRegion === region.name.toUpperCase();
                  const isHoveredRegion =
                    hoveredState && getStateRegion(hoveredState) === key;

                  return (
                    <div
                      key={key}
                      className={`flex items-center space-x-3 cursor-pointer p-2 rounded transition-all duration-200 ${
                        isCurrentRegion
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                          : isHoveredRegion
                          ? "bg-gray-100 dark:bg-gray-700 shadow-md"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() =>
                        setSelectedRegion(region.name.toUpperCase())
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                          isHoveredRegion
                            ? "w-5 h-5 shadow-lg"
                            : "border-gray-300"
                        }`}
                        style={{
                          backgroundColor: isHoveredRegion
                            ? region.hoverColor
                            : region.color,
                          borderColor: isHoveredRegion
                            ? region.hoverColor
                            : undefined,
                        }}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          isCurrentRegion
                            ? "text-blue-700 dark:text-blue-300"
                            : ""
                        }`}
                      >
                        {region.name}
                      </span>
                      {isCurrentRegion && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
