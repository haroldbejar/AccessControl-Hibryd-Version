using Microsoft.AspNetCore.SignalR;

namespace AccessControl.API.Hubs;

public class PhotoHub : Hub
{
    public async Task JoinSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
    }
}
