# COMRADIO PROTOCOL v2

### Topic names
The default topic name is "comradio:".
All topic names should follow the following format:
comradio:[channel name]
Example: comradio:cats, comradio:

### Messages
Every message must be a JSON-encoded dictionary containing the following items:
* Type: type of message (see section below)
* Content: depends on type
* Comment: depends on type (only displayed if type isn't "text")
* Author: user ID of sender
* Nickname: the nickname of the author (in revision 2.1)

The most common possible message type are listed below. See more message types in the Extra section.
* text
* image
* sound

### Examples
```json
{
	"Type": "sound", // this also works for the `image` message type
	"Content": "rbxassetid://1337",
	"Comment": "B)",
	"Author": 2
}
```
> [John Doe]: B)
> [sound player]
```json
{
	"Type": "text",
	"Content": "Hi everyone! How are you all doing?",
	"Comment": "",
	"Author": 3
}
```
> [Jane Doe]: Hi everyone! How are you all doing?

## Extra
### Welcome messages
When a listener joins a channel, they should send a "welcome" message.
```json
{
	"Type": "welcome",
	"Content": "",
	"Comment": "",
	"Author": 3
}
```
Every listener in the channel can display the welcome message in any way possible.
> {author} has joined the channel.

### Pings
Pings can be used to notify a listener. The content value should be the listener being pinged.
```json
{
	"Type": "ping",
	"Content": "3",
	"Comment": "Hello",
	"Author": 2
}
```
> [{author}]: {comment} @{contents}

### Status messages
Status messages are used to broadcast the status of a listener. The status will be visible to every listener
in the same channel.
You should use the `text` message type instead.
```json
{
	"Type": "status",
	"Content": "",
	"Comment": "changed channel",
	"Author": 4
}
```
> {author}s new status is {comment}

### Roster (revision 2.1)
Rosters can be used to see active users in a channel.
A roster request may be sent using the following example:
```json
{
	"Type": "rosterRequest",
	"Content": "",
	"Author": 4
}
```
Users willing to be part of the roster should respond with the following example within 1 second:
```
{
	"Type": "rosterResponse",
	"Content": "",
	"Author": 2
}
```

### Nicknames (revision 2.1)
Users may use nicknames using the Nickname field. The original username of the author should still be displayed when displaying the Nickname.
```
{
	"Type": "text",
	"Content": "Example message",
	"Author": 1,
	"Nickname": "Example nickname"
}
```

## Security issues

### Impersonation
A user may easily be impersonated by sending a message with the Author being set to the ID of the target. There is no way to circumvent this without using cryptographic signatures or any other challenges proving the identity of the author, due to the decentralized nature of this protocol.
