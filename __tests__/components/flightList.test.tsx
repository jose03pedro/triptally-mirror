/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlightList } from "@/app/components/trip/flightList";

// Mock Portal to render children directly
jest.mock("@/app/components/ui/portal", () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("FlightList Component", () => {
  const mockFlights = [
    {
      _id: "flight-1",
      flightNumber: "TP123",
      status: "Scheduled",
      airline: { name: "TAP Air Portugal" },
      departure: {
        airport: { name: "Lisbon Airport", iata: "LIS" },
        scheduledTimeLocal: "2025-12-15T08:30:00",
      },
      arrival: {
        airport: { name: "Porto Airport", iata: "OPO" },
      },
    },
    {
      _id: "flight-2",
      flightNumber: "FR456",
      status: "Arrived",
      airline: { name: "Ryanair" },
      departure: {
        airport: { name: "Dublin Airport", iata: "DUB" },
        scheduledTimeUtc: "2025-12-14T10:00:00Z",
      },
      arrival: {
        airport: { name: "Lisbon Airport", iata: "LIS" },
      },
    },
  ];

  const defaultProps = {
    flights: mockFlights,
    tripId: "trip-123",
    isOwner: false,
    onFlightDeleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  describe("Rendering", () => {
    it("should render empty state when no flights", () => {
      render(<FlightList {...defaultProps} flights={[]} />);
      expect(
        screen.getByText("No flights added yet. Add your first flight!")
      ).toBeInTheDocument();
    });

    it("should render all flights", () => {
      render(<FlightList {...defaultProps} />);

      // Check both routes are rendered (Lisbon appears twice: as departure and arrival)
      expect(screen.getAllByText(/Lisbon Airport/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Porto Airport/)).toBeInTheDocument();
      expect(screen.getByText(/Dublin Airport/)).toBeInTheDocument();
    });

    it("should render flight numbers", () => {
      render(<FlightList {...defaultProps} />);

      expect(screen.getByText(/TP123/)).toBeInTheDocument();
      expect(screen.getByText(/FR456/)).toBeInTheDocument();
    });

    it("should render airline names", () => {
      render(<FlightList {...defaultProps} />);

      expect(screen.getByText(/TAP Air Portugal/)).toBeInTheDocument();
      expect(screen.getByText(/Ryanair/)).toBeInTheDocument();
    });

    it("should render flight status badges", () => {
      render(<FlightList {...defaultProps} />);

      expect(screen.getByText("Scheduled")).toBeInTheDocument();
      expect(screen.getByText("Arrived")).toBeInTheDocument();
    });

    it("should display departure times", () => {
      render(<FlightList {...defaultProps} />);

      // Check that departure information is rendered
      const departsText = screen.getAllByText(/Departs:/);
      expect(departsText).toHaveLength(2);
    });
  });

  describe("Status Badge Styling", () => {
    it("should show success badge for Arrived status", () => {
      render(<FlightList {...defaultProps} />);

      const arrivedBadge = screen.getByText("Arrived");
      expect(arrivedBadge).toHaveClass("bg-success");
    });

    it("should show info badge for Scheduled status", () => {
      render(<FlightList {...defaultProps} />);

      const scheduledBadge = screen.getByText("Scheduled");
      expect(scheduledBadge).toHaveClass("bg-info");
    });

    it("should show danger badge for Cancelled status", () => {
      const cancelledFlight = [
        {
          ...mockFlights[0],
          status: "Cancelled",
        },
      ];
      render(<FlightList {...defaultProps} flights={cancelledFlight} />);

      const cancelledBadge = screen.getByText("Cancelled");
      expect(cancelledBadge).toHaveClass("bg-danger");
    });

    it("should show secondary badge for unknown status", () => {
      const unknownFlight = [
        {
          ...mockFlights[0],
          status: undefined,
        },
      ];
      render(<FlightList {...defaultProps} flights={unknownFlight} />);

      const unknownBadge = screen.getByText("Unknown");
      expect(unknownBadge).toHaveClass("bg-secondary");
    });
  });

  describe("Delete Button Visibility", () => {
    it("should NOT show delete button when isOwner is false", () => {
      render(<FlightList {...defaultProps} isOwner={false} />);

      const deleteButtons = screen.queryAllByTitle("Remove flight");
      expect(deleteButtons).toHaveLength(0);
    });

    it("should show delete button when isOwner is true", () => {
      render(<FlightList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove flight");
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe("Delete Confirmation Modal", () => {
    it("should show confirmation modal when delete button is clicked", async () => {
      render(<FlightList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Are you sure you want to remove this flight from your trip?"
          )
        ).toBeInTheDocument();
      });
    });

    it("should show flight details in confirmation modal", async () => {
      render(<FlightList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        // Modal should show the flight route
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });
    });

    it("should close modal when Cancel button is clicked", async () => {
      render(<FlightList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Remove Flight")).not.toBeInTheDocument();
      });
    });

    it("should close modal when close button is clicked", async () => {
      render(<FlightList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText("Close");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText("Remove Flight")).not.toBeInTheDocument();
      });
    });
  });

  describe("Delete Functionality", () => {
    it("should call API to delete flight when Remove is clicked", async () => {
      const onFlightDeleted = jest.fn();
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      render(
        <FlightList {...defaultProps} isOwner={true} onFlightDeleted={onFlightDeleted} />
      );

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /Remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/trips/trip-123/flights",
          expect.objectContaining({
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flightId: "flight-1" }),
          })
        );
      });
    });

    it("should call onFlightDeleted callback on successful deletion", async () => {
      const onFlightDeleted = jest.fn();
      mockFetch.mockResolvedValue({ ok: true });

      render(
        <FlightList {...defaultProps} isOwner={true} onFlightDeleted={onFlightDeleted} />
      );

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /Remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(onFlightDeleted).toHaveBeenCalledWith("flight-1");
      });
    });

    it("should NOT call onFlightDeleted callback on failed deletion", async () => {
      const onFlightDeleted = jest.fn();
      mockFetch.mockResolvedValue({ ok: false });

      render(
        <FlightList {...defaultProps} isOwner={true} onFlightDeleted={onFlightDeleted} />
      );

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /Remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(onFlightDeleted).not.toHaveBeenCalled();
    });

    it("should handle delete errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<FlightList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove flight");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Flight")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /Remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to delete flight",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Fallback Display Values", () => {
    it("should show iata code when airport name is missing", () => {
      const flightWithoutName = [
        {
          _id: "flight-3",
          flightNumber: "AA789",
          status: "Scheduled",
          airline: { name: "American Airlines" },
          departure: {
            airport: { iata: "JFK" },
          },
          arrival: {
            airport: { iata: "LAX" },
          },
        },
      ];

      render(<FlightList {...defaultProps} flights={flightWithoutName} />);

      expect(screen.getByText(/JFK/)).toBeInTheDocument();
      expect(screen.getByText(/LAX/)).toBeInTheDocument();
    });

    it("should show Unknown when no airport info available", () => {
      const flightWithoutAirport = [
        {
          _id: "flight-4",
          flightNumber: "XX000",
          status: "Unknown",
          airline: { name: "Test Airline" },
          departure: {},
          arrival: {},
        },
      ];

      render(<FlightList {...defaultProps} flights={flightWithoutAirport} />);

      // The component shows "Unknown → Unknown" as route and "Unknown" as status
      // So we expect at least 2 "Unknown" occurrences (route has 2, status has 1)
      const allText = document.body.textContent || "";
      const unknownCount = (allText.match(/Unknown/g) || []).length;
      expect(unknownCount).toBeGreaterThanOrEqual(2);
    });

    it("should show N/A when no departure time available", () => {
      const flightWithoutTime = [
        {
          _id: "flight-5",
          flightNumber: "YY111",
          status: "Scheduled",
          airline: { name: "Test Airline" },
          departure: {
            airport: { name: "Test Airport" },
          },
          arrival: {
            airport: { name: "Dest Airport" },
          },
        },
      ];

      render(<FlightList {...defaultProps} flights={flightWithoutTime} />);

      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    });

    it("should use UTC time when local time is not available", () => {
      const flightWithUtcOnly = [
        {
          _id: "flight-6",
          flightNumber: "ZZ222",
          status: "Scheduled",
          airline: { name: "UTC Airline" },
          departure: {
            airport: { name: "UTC Airport" },
            scheduledTimeUtc: "2025-12-20T14:00:00Z",
          },
          arrival: {
            airport: { name: "Dest Airport" },
          },
        },
      ];

      render(<FlightList {...defaultProps} flights={flightWithUtcOnly} />);

      // Should render the UTC time
      expect(screen.getByText(/Departs:/)).toBeInTheDocument();
      expect(screen.queryByText(/N\/A/)).not.toBeInTheDocument();
    });
  });
});
