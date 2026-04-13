using System.Collections.Concurrent;

namespace AccessControl.API.Services;

public record PhotoSession(string SessionId, string Token, DateTime ExpiresAt);

public class PhotoSessionService
{
    private readonly ConcurrentDictionary<string, PhotoSession> _sessions = new();

    public (string SessionId, string Token) CreateSession()
    {
        var sessionId = Guid.NewGuid().ToString("N");
        var token = Guid.NewGuid().ToString("N");
        var session = new PhotoSession(sessionId, token, DateTime.UtcNow.AddMinutes(10));
        _sessions[sessionId] = session;
        CleanExpired();
        return (sessionId, token);
    }

    public bool ValidateAndConsume(string sessionId, string token)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            return false;

        if (session.Token != token || session.ExpiresAt < DateTime.UtcNow)
        {
            _sessions.TryRemove(sessionId, out _);
            return false;
        }

        _sessions.TryRemove(sessionId, out _); // uso único
        return true;
    }

    private void CleanExpired()
    {
        var now = DateTime.UtcNow;
        foreach (var key in _sessions.Keys)
        {
            if (_sessions.TryGetValue(key, out var s) && s.ExpiresAt < now)
                _sessions.TryRemove(key, out _);
        }
    }
}
