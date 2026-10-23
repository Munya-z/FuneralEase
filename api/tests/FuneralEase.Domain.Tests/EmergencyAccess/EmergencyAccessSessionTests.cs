using FuneralEase.Domain.Common;
using FuneralEase.Domain.EmergencyAccess;
using FuneralEase.Domain.EmergencyAccess.Events;
using Xunit;

namespace FuneralEase.Domain.Tests.EmergencyAccess;

public class EmergencyAccessSessionTests
{
    private static EmergencyAccessSession CreateSession() =>
        EmergencyAccessSession.Create(HouseholdId.New());

    private static List<(string, string, string, string?, AccessMode)> OneContact() =>
        [("Jane Doe", "+27821234567", "Spouse", null, AccessMode.Delayed)];

    [Fact]
    public void UpsertContacts_ShouldReplaceExistingContacts()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());
        session.UpsertContacts([("Bob Smith", "+27831234567", "Brother", null, AccessMode.Immediate)]);

        Assert.Single(session.Contacts);
        Assert.Equal("Bob Smith", session.Contacts[0].FullName);
    }

    [Fact]
    public void RequestAccess_ShouldCreateGrant()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());

        var contactId = session.Contacts[0].Id;
        var grant = session.RequestAccess(contactId, UserId.New(), TimeSpan.FromHours(1), TimeSpan.FromHours(48));

        Assert.NotNull(grant);
        Assert.False(grant.IsRevoked);
        Assert.Single(session.Grants);
    }

    [Fact]
    public void RequestAccess_ShouldRaiseGrantActivatedEvent()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());
        session.ClearDomainEvents(); // clear UpsertContacts events

        session.RequestAccess(session.Contacts[0].Id, UserId.New(), TimeSpan.Zero, TimeSpan.FromHours(1));

        Assert.Contains(session.DomainEvents, e => e is GrantActivatedEvent);
    }

    [Fact]
    public void RequestAccess_ForUnknownContact_ShouldThrow()
    {
        var session = CreateSession();

        Assert.Throws<InvalidOperationException>(() =>
            session.RequestAccess(EmergencyContactId.New(), UserId.New(), TimeSpan.Zero, TimeSpan.FromHours(1)));
    }

    [Fact]
    public void RevokeGrant_ShouldMarkGrantAsRevoked()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());
        var grant = session.RequestAccess(session.Contacts[0].Id, UserId.New(), TimeSpan.Zero, TimeSpan.FromHours(1));

        session.RevokeGrant(grant.Id, UserId.New());

        Assert.True(grant.IsRevoked);
        Assert.NotNull(grant.RevokedAt);
    }

    [Fact]
    public void RevokeGrant_ShouldRaiseGrantRevokedEvent()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());
        var grant = session.RequestAccess(session.Contacts[0].Id, UserId.New(), TimeSpan.Zero, TimeSpan.FromHours(1));
        session.ClearDomainEvents();

        session.RevokeGrant(grant.Id, UserId.New());

        Assert.Contains(session.DomainEvents, e => e is GrantRevokedEvent);
    }

    [Fact]
    public void RevokeGrant_WhenAlreadyRevoked_ShouldThrow()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());
        var grant = session.RequestAccess(session.Contacts[0].Id, UserId.New(), TimeSpan.Zero, TimeSpan.FromHours(1));
        session.RevokeGrant(grant.Id, UserId.New());

        Assert.Throws<InvalidOperationException>(() =>
            session.RevokeGrant(grant.Id, UserId.New()));
    }

    [Fact]
    public void AuditEntries_ShouldAccumulateActions()
    {
        var session = CreateSession();
        session.UpsertContacts(OneContact());
        var grant = session.RequestAccess(session.Contacts[0].Id, UserId.New(), TimeSpan.Zero, TimeSpan.FromHours(1));
        session.RevokeGrant(grant.Id, UserId.New());

        Assert.Equal(3, session.AuditEntries.Count); // ContactsUpdated + AccessRequested + AccessRevoked
    }
}
