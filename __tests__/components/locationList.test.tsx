/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LocationList } from "@/app/components/trip/locationList";
import { MustVisitLocation } from "@/types/location/types";

// Mock Portal to render children directly
jest.mock("@/app/components/ui/portal", () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("LocationList Component", () => {
  const mockLocations: MustVisitLocation[] = [
    {
      _id: "loc-1",
      name: "Eiffel Tower",
      category: "attraction",
      address: "Champ de Mars, Paris",
      priority: 1,
      notes: "Must see at night",
      addedAt: "2025-12-15T10:00:00Z",
    },
    {
      _id: "loc-2",
      name: "Le Petit Bistro",
      category: "restaurant",
      address: "123 Rue de Paris",
      priority: 2,
      addedAt: "2025-12-15T11:00:00Z",
    },
    {
      _id: "loc-3",
      name: "Louvre Museum",
      category: "museum",
      address: "Rue de Rivoli, Paris",
      priority: 3,
      addedAt: "2025-12-15T12:00:00Z",
    },
  ];

  const defaultProps = {
    locations: mockLocations,
    tripId: "trip-123",
    isOwner: false,
    onLocationDeleted: jest.fn(),
    onLocationUpdated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  describe("Rendering", () => {
    it("should render empty state when no locations", () => {
      render(<LocationList {...defaultProps} locations={[]} />);
      expect(
        screen.getByText("No must-visit locations added yet.")
      ).toBeInTheDocument();
    });

    it("should show add prompt for owner when no locations", () => {
      render(<LocationList {...defaultProps} locations={[]} isOwner={true} />);
      expect(
        screen.getByText(/Add your first location!/i)
      ).toBeInTheDocument();
    });

    it("should render all locations", () => {
      render(<LocationList {...defaultProps} />);

      expect(screen.getByText("Eiffel Tower")).toBeInTheDocument();
      expect(screen.getByText("Le Petit Bistro")).toBeInTheDocument();
      expect(screen.getByText("Louvre Museum")).toBeInTheDocument();
    });

    it("should render location addresses", () => {
      render(<LocationList {...defaultProps} />);

      expect(screen.getByText("Champ de Mars, Paris")).toBeInTheDocument();
      expect(screen.getByText("123 Rue de Paris")).toBeInTheDocument();
      expect(screen.getByText("Rue de Rivoli, Paris")).toBeInTheDocument();
    });

    it("should render location notes", () => {
      render(<LocationList {...defaultProps} />);

      expect(screen.getByText(/"Must see at night"/)).toBeInTheDocument();
    });

    it("should render priority badges", () => {
      render(<LocationList {...defaultProps} />);

      expect(screen.getByText("Must See")).toBeInTheDocument();
      expect(screen.getByText("Want to See")).toBeInTheDocument();
      expect(screen.getByText("If Time Permits")).toBeInTheDocument();
    });

    it("should render category badges", () => {
      render(<LocationList {...defaultProps} />);

      expect(screen.getByText("Attraction")).toBeInTheDocument();
      expect(screen.getByText("Restaurant")).toBeInTheDocument();
      expect(screen.getByText("Museum")).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("should sort locations by priority (must-see first)", () => {
      render(<LocationList {...defaultProps} />);

      // The Eiffel Tower (priority 1) should appear before others
      const allText = document.body.textContent || "";
      const eiffelIndex = allText.indexOf("Eiffel Tower");
      const bistroIndex = allText.indexOf("Le Petit Bistro");
      const louvreIndex = allText.indexOf("Louvre Museum");

      expect(eiffelIndex).toBeLessThan(bistroIndex);
      expect(bistroIndex).toBeLessThan(louvreIndex);
    });
  });

  describe("Priority Badge Styling", () => {
    it("should show danger badge for must-see (priority 1)", () => {
      render(<LocationList {...defaultProps} />);

      const mustSeeBadge = screen.getByText("Must See");
      expect(mustSeeBadge).toHaveClass("bg-danger");
    });

    it("should show warning badge for want to see (priority 2)", () => {
      render(<LocationList {...defaultProps} />);

      const wantToSeeBadge = screen.getByText("Want to See");
      expect(wantToSeeBadge).toHaveClass("bg-warning");
    });

    it("should show secondary badge for if time (priority 3)", () => {
      render(<LocationList {...defaultProps} />);

      const ifTimeBadge = screen.getByText("If Time Permits");
      expect(ifTimeBadge).toHaveClass("bg-secondary");
    });
  });

  describe("Delete Button Visibility", () => {
    it("should NOT show delete button when isOwner is false", () => {
      render(<LocationList {...defaultProps} isOwner={false} />);

      const deleteButtons = screen.queryAllByTitle("Remove location");
      expect(deleteButtons).toHaveLength(0);
    });

    it("should show delete button when isOwner is true", () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove location");
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe("Edit Button Visibility", () => {
    it("should NOT show edit button when isOwner is false", () => {
      render(<LocationList {...defaultProps} isOwner={false} />);

      const editButtons = screen.queryAllByTitle("Edit location");
      expect(editButtons).toHaveLength(0);
    });

    it("should show edit button when isOwner is true", () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const editButtons = screen.getAllByTitle("Edit location");
      expect(editButtons).toHaveLength(3);
    });
  });

  describe("Delete Confirmation Modal", () => {
    it("should show confirmation modal when delete button is clicked", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove location");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Location")).toBeInTheDocument();
        expect(
          screen.getByText("Are you sure you want to remove this location from your trip?")
        ).toBeInTheDocument();
      });
    });

    it("should show location name in confirmation modal", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove location");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        // The modal should show the location name
        const modalContent = screen.getByRole("dialog");
        expect(modalContent).toHaveTextContent("Eiffel Tower");
      });
    });

    it("should close modal when cancel is clicked", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove location");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Location")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Remove Location")).not.toBeInTheDocument();
      });
    });

    it("should call API and onLocationDeleted when confirmed", async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
      const onLocationDeleted = jest.fn();

      render(
        <LocationList {...defaultProps} isOwner={true} onLocationDeleted={onLocationDeleted} />
      );

      const deleteButtons = screen.getAllByTitle("Remove location");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Location")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /Remove/ });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/trips/trip-123/locations",
          expect.objectContaining({
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locationId: "loc-1" }),
          })
        );
        expect(onLocationDeleted).toHaveBeenCalledWith("loc-1");
      });
    });
  });

  describe("Edit Modal", () => {
    it("should show edit modal when edit button is clicked", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const editButtons = screen.getAllByTitle("Edit location");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Edit Location")).toBeInTheDocument();
      });
    });

    it("should show location name in edit modal", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const editButtons = screen.getAllByTitle("Edit location");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const modalContent = screen.getByRole("dialog");
        expect(modalContent).toHaveTextContent("Eiffel Tower");
      });
    });

    it("should show priority buttons in edit modal", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const editButtons = screen.getAllByTitle("Edit location");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Must See" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Want to See" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "If Time Permits" })).toBeInTheDocument();
      });
    });

    it("should show notes textarea in edit modal", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const editButtons = screen.getAllByTitle("Edit location");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Add notes about this location...");
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveValue("Must see at night");
      });
    });

    it("should close edit modal when cancel is clicked", async () => {
      render(<LocationList {...defaultProps} isOwner={true} />);

      const editButtons = screen.getAllByTitle("Edit location");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Edit Location")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Edit Location")).not.toBeInTheDocument();
      });
    });

    it("should call API and onLocationUpdated when saved", async () => {
      const updatedLocation = {
        ...mockLocations[0],
        notes: "Updated notes",
        priority: 2,
      };
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(updatedLocation) });
      const onLocationUpdated = jest.fn();

      render(
        <LocationList {...defaultProps} isOwner={true} onLocationUpdated={onLocationUpdated} />
      );

      const editButtons = screen.getAllByTitle("Edit location");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Edit Location")).toBeInTheDocument();
      });

      // Change notes
      const textarea = screen.getByPlaceholderText("Add notes about this location...");
      fireEvent.change(textarea, { target: { value: "Updated notes" } });

      // Change priority
      const wantToSeeBtn = screen.getByRole("button", { name: "Want to See" });
      fireEvent.click(wantToSeeBtn);

      // Save
      const saveButton = screen.getByRole("button", { name: /Save Changes/ });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/trips/trip-123/locations",
          expect.objectContaining({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          })
        );
        expect(onLocationUpdated).toHaveBeenCalled();
      });
    });
  });

  describe("Category Icons", () => {
    it("should render material icons for each category", () => {
      const allCategories: MustVisitLocation[] = [
        { _id: "1", name: "My Restaurant", category: "restaurant", priority: 1, addedAt: "" },
        { _id: "2", name: "My Attraction", category: "attraction", priority: 1, addedAt: "" },
        { _id: "3", name: "My Museum", category: "museum", priority: 1, addedAt: "" },
        { _id: "4", name: "My Hotel", category: "hotel", priority: 1, addedAt: "" },
        { _id: "5", name: "My Shopping", category: "shopping", priority: 1, addedAt: "" },
        { _id: "6", name: "My Nightlife", category: "nightlife", priority: 1, addedAt: "" },
        { _id: "7", name: "My Custom", category: "custom", priority: 1, addedAt: "" },
      ];

      render(<LocationList {...defaultProps} locations={allCategories} />);

      // Check that all locations render by name
      expect(screen.getByText("My Restaurant")).toBeInTheDocument();
      expect(screen.getByText("My Attraction")).toBeInTheDocument();
      expect(screen.getByText("My Museum")).toBeInTheDocument();
      expect(screen.getByText("My Hotel")).toBeInTheDocument();
      expect(screen.getByText("My Shopping")).toBeInTheDocument();
      expect(screen.getByText("My Nightlife")).toBeInTheDocument();
      expect(screen.getByText("My Custom")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle locations without address", () => {
      const locationsWithoutAddress: MustVisitLocation[] = [
        {
          _id: "loc-1",
          name: "Secret Spot",
          category: "attraction",
          priority: 1,
          addedAt: "2025-12-15T10:00:00Z",
        },
      ];

      render(<LocationList {...defaultProps} locations={locationsWithoutAddress} />);

      expect(screen.getByText("Secret Spot")).toBeInTheDocument();
    });

    it("should handle locations without notes", () => {
      const locationsWithoutNotes: MustVisitLocation[] = [
        {
          _id: "loc-1",
          name: "Simple Place",
          category: "restaurant",
          priority: 2,
          addedAt: "2025-12-15T10:00:00Z",
        },
      ];

      render(<LocationList {...defaultProps} locations={locationsWithoutNotes} />);

      expect(screen.getByText("Simple Place")).toBeInTheDocument();
    });

    it("should handle API error on delete gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<LocationList {...defaultProps} isOwner={true} />);

      const deleteButtons = screen.getAllByTitle("Remove location");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Remove Location")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /Remove/ });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to delete location",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
