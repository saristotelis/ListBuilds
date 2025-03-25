import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import custom CSS colors

 // Use environment variables
 const BITRISE_API_TOKEN = process.env.REACT_APP_BITRISE_API_TOKEN;
 const APP_SLUG = process.env.REACT_APP_BITRISE_APP_SLUG;

function App() {
  const [builds, setBuilds] = useState([]);
  const [filteredBuilds, setFilteredBuilds] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    branch: "",
    app_title: "",
    buildNumber: "", // Add buildNumber filter
    sortBy: "date",
  });
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.bitrise.io/v0.1/apps/${APP_SLUG}/builds`,
        {
          headers: {
            Authorization: BITRISE_API_TOKEN,
          },
        }
      );
  
      const buildsWithDetails = await Promise.all(
        response.data.data.map(async (build) => {
          const logResponse = await axios.get(
            `https://api.bitrise.io/v0.1/apps/${APP_SLUG}/builds/${build.slug}/log`,
            {
              headers: {
                Authorization: BITRISE_API_TOKEN,
              },
            }
          );
  
          let publicInstallPageUrl = null;
          let bitriseDownloadPageUrl = null;
          let appTitle = null; // Add appTitle to store the app target name
  
          if (build.status_text === "success") {
            try {
              const artifactsResponse = await axios.get(
                `https://api.bitrise.io/v0.1/apps/${APP_SLUG}/builds/${build.slug}/artifacts`,
                {
                  headers: {
                    Authorization: BITRISE_API_TOKEN,
                  },
                }
              );
  
              // Find the first artifact with non-null artifact_meta
              const artifactWithMeta = artifactsResponse.data.data.find(
                (artifact) => artifact.artifact_meta !== null
              );
  
              if (artifactWithMeta) {
                // Fetch detailed artifact data using the artifact slug
                const artifactDetailResponse = await axios.get(
                  `https://api.bitrise.io/v0.1/apps/${APP_SLUG}/builds/${build.slug}/artifacts/${artifactWithMeta.slug}`,
                  {
                    headers: {
                      Authorization: BITRISE_API_TOKEN,
                    },
                  }
                );
  
                publicInstallPageUrl = artifactDetailResponse.data.data.public_install_page_url;
                bitriseDownloadPageUrl = `https://app.bitrise.io/app/${APP_SLUG}/installable-artifacts/${artifactWithMeta.slug}`;
  
                // Extract app_title from artifact_meta
                if (artifactDetailResponse.data.data.artifact_meta?.app_info?.app_title) {
                  appTitle = artifactDetailResponse.data.data.artifact_meta.app_info.app_title;
                }
              }
            } catch (error) {
              console.error("Error fetching artifacts:", error);
            }
          }
  
          return {
            ...build,
            log_url: logResponse.data.expiring_raw_log_url,
            build_url: build.build_url || `https://app.bitrise.io/build/${build.slug}`,
            public_install_page_url: publicInstallPageUrl,
            bitrise_download_page_url: bitriseDownloadPageUrl,
            app_title: appTitle, // Add app_title to the build object
          };
        })
      );
  
      setBuilds(buildsWithDetails);
      setFilteredBuilds(buildsWithDetails);
    } catch (error) {
      console.error("Error fetching builds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    applyFilters({ ...filters, [name]: value });
  };

  const applyFilters = (filters) => {
    let filtered = builds;
  
    if (filters.status) {
      filtered = filtered.filter((build) => build.status_text === filters.status);
    }
  
    if (filters.branch) {
      filtered = filtered.filter((build) => build.branch === filters.branch);
    }
  
    if (filters.app_title) {
      filtered = filtered.filter((build) => build.app_title === filters.app_title);
    }
  
    if (filters.buildNumber) {
      filtered = filtered.filter((build) =>
        build.build_number.toString().includes(filters.buildNumber)
      );
    }
  
    if (filters.sortBy === "date") {
      filtered.sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
    } else if (filters.sortBy === "status") {
      filtered.sort((a, b) => a.status_text.localeCompare(b.status_text));
    }
  
    setFilteredBuilds(filtered);
  };

  return (
    <div className="container-fluid p-4 bg-listbuilds-blue min-vh-100">
      <h1 className="text-center mb-4 text-white display-4 fw-bold">Bitrise Builds</h1>

      {/* Filters */}
      <div className="card mb-4 bg-listbuilds-white shadow-lg">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <select
                name="app_title"
                value={filters.app_title}
                onChange={handleFilterChange}
                className="form-select bg-listbuilds-white text-listbuilds-blue border-listbuilds-blue"
              >
                <option value="">All App Targets</option>
                {[...new Set(builds.map((build) => build.app_title))].map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select bg-listbuilds-white text-listbuilds-blue border-listbuilds-blue"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="branch"
                placeholder="Filter by branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="form-control bg-listbuilds-white text-listbuilds-blue border-listbuilds-blue"
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="buildNumber"
                placeholder="Search by build number"
                value={filters.buildNumber}
                onChange={handleFilterChange}
                className="form-control bg-listbuilds-white text-listbuilds-blue border-listbuilds-blue"
              />
            </div>
            <div className="col-md-4">
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="form-select bg-listbuilds-white text-listbuilds-blue border-listbuilds-blue"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center">
          <div className="spinner-border text-listbuilds-gold" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-white">Loading builds...</p>
        </div>
      )}

      {/* Builds List */}
      {!isLoading && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredBuilds.map((build) => (
            <div key={build.slug} className="col">
              <div className="card h-100 shadow-sm bg-listbuilds-white border-0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-listbuilds-blue fw-bold">Build #{build.build_number}</h5>
                  <p className="card-text">
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        build.status_text === "success"
                          ? "text-listbuilds-green"
                          : build.status_text === "error"
                          ? "text-listbuilds-red"
                          : "text-listbuilds-gold"
                      }
                    >
                      {build.status_text}
                    </span>
                  </p>
                  <p className="card-text text-listbuilds-blue">
                  <strong>App Target:</strong> {build.app_title || "N/A"}
                </p>
                  <p className="card-text text-listbuilds-blue">
                    <strong>Branch:</strong> {build.branch}
                  </p>
                  <p className="card-text text-listbuilds-blue">
                    <strong>Commit:</strong> {build.commit_message}
                  </p>
                  <p className="card-text text-listbuilds-blue">
                    <strong>Started:</strong>{" "}
                    {new Date(build.triggered_at).toLocaleString()}
                  </p>
                  <div className="d-flex gap-2 mt-auto">
                    {build.log_url && (
                      <a
                        href={build.log_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-listbuilds-blue btn-sm flex-grow-1 border-listbuilds-blue"
                      >
                        View Logs
                      </a>
                    )}
                    <a
                      href={build.build_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-listbuilds-gold btn-sm flex-grow-1 border-listbuilds-gold"
                    >
                      View Build
                    </a>
                    {build.status_text === "success" && build.public_install_page_url && (
                      <a
                        href={build.public_install_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-listbuilds-green btn-sm flex-grow-1 border-listbuilds-green"
                      >
                        Public Download
                      </a>
                    )}
                    {build.status_text === "success" && build.bitrise_download_page_url && (
                      <a
                        href={build.bitrise_download_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-listbuilds-red btn-sm flex-grow-1 border-listbuilds-red"
                      >
                        Bitrise Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;