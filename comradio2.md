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

The most common possible message type are listed below. See more message types in the Extra section.
* text
* image
* sound

### Examples
```json
{
	"Type": "sound", // this also works for the `image` message type
	"Contents": "rbxassetid://1337",
	"Comment": "B)",
	"Author": 2
}
```
> [John Doe]: B)
> [sound player]
```json
{
	"Type": "text",
	"Contents": "Hi everyone! How are you all doing?",
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
	"Contents": "",
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
	"Contents": "3",
	"Comment": "Hello",
	"Author": 2
}
```
> [{author}]: {comment} @{contents}

### Diffie-Hellman Key Exchange
You can use this message type to easily exchange secrets with another listener.
The comment is used to tell the stage of the exchange and who the message is targeted to.
The comment value can be "1a;3", which means stage 1a targeted to listener 3.
A key exchange might look like this:
1. Alice sends the modulus `p = 23` and base `g = 5`
```json
{
	"Type": "diffieHellmanExchange",
	"Contents": "23;5",
	"Comment": "1a;3",
	"Author": 2
}
```
2. Bob confirms that they received the message, chooses a secret integer `b = 3`, and sends
Alice the modulus, base and `B = g^b % p`
```json
{
	"Type": "diffieHellmanExchange",
	"Contents": "23;5",
	"Comment": "1b;2;10",
	"Author": 3
}
```
3. Alice (id 2) chooses a secret integer `a = 4`, then sends Bob `A = g^a % p`
```json
{
	"Type": "diffieHellmanExchange",
	"Contents": "4",
	"Comment": "2a;3",
	"Author": 2
}
```
4. Bob (id 3) confirms they received the message.
```json
{
	"Type": "diffieHellmanExchange",
	"Contents": "confirmed",
	"Comment": "2b;2",
	"Author": 3
}
```
5. Alice computes `s = B^a % p`
```lua
local s = B^a % p
```
6. Bob computes `s = A^b % p`
```lua
local s = A^b % p
```
7. Alice sends a message to show that she has the secret key
```json
{
	"Type": "diffieHellmanExchange",
	"Contents": "confirmed",
	"Comment": "3;3",
	"Author": 2
}
```
8. Bob sends a message to show that she has the secret key
```json
{
	"Type": "diffieHellmanExchange",
	"Contents": "confirmed",
	"Comment": "3;2",
	"Author": 3
}
```
9. Alice and Bob now share a secret key.dwww
This can be used for creating private channels to share with another listener or
sending encrypted messages.
The shared key should be stored for later usage (see section below).

### Encrypted messages
The contents should be the target listener ID. The comment must be semicolon-seperated
decimal numbers that will be decrypted with the XOR cipher using the saved shared key.
```json
{
	"Type": "encrypted",
	"Contents": "2",
	"Comment": "24;4;31;31;24", // decrypt this with "password"
	"Author": "3"
}
```
> [{author}]: [ENCRYPTED] {decrypted message}

### Status messages
Status messages are used to broadcast the status of a listener. The status will be visible to every listener
in the same channel.
You should use the `text` message type instead.
```json
{
	"Type": "status",
	"Contents": "",
	"Comment": "changed channel",
	"Author": 4
}
```
> {author}s new status is {comment}
