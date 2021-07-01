declare const owner: Player;

const ms: MessagingService = game.GetService("MessagingService");
const text: TextService = game.GetService("TextService");
const players: Players = game.GetService("Players");
const http: HttpService = game.GetService("HttpService");

const char: Model = owner.Character!;
const head: BasePart | undefined = char.FindFirstChild("Head") as BasePart;

interface subscribeCallback {
	Data: string;
	Sent: unknown;
}

interface comradioProtocol {
	Type: "text" | "image" | "welcome" | "sound";
	Content: string;
	Comment: string;
	Author: number;
}

const screen: Part = new Instance("Part", script);
screen.Material = Enum.Material.Glass;
screen.BrickColor = new BrickColor("Black");
screen.Transparency = 0.6;
screen.Reflectance = 0.2;
screen.Size = new Vector3(10, 7, 1);
screen.CFrame = head.CFrame.add(new Vector3(0, 0, 5));
screen.Anchored = true;

const gui: SurfaceGui = new Instance("SurfaceGui", screen);
gui.Face = Enum.NormalId.Back;

const scroller: ScrollingFrame = new Instance("ScrollingFrame", gui);
scroller.BackgroundTransparency = 1;
scroller.Size = UDim2.fromScale(1, 1);
scroller.CanvasSize = UDim2.fromScale(1, 6);

const layout: UIListLayout = new Instance("UIListLayout", scroller);
layout.HorizontalAlignment = Enum.HorizontalAlignment.Left;
layout.VerticalAlignment = Enum.VerticalAlignment.Top;
layout.SortOrder = Enum.SortOrder.Name;

function output(text: string) {
	const box: TextBox = new Instance("TextBox", scroller);
	box.BackgroundTransparency = 1;
	box.TextColor3 = new Color3(1, 1, 1);
	box.Text = text;
	box.TextSize = 15;
	box.RichText = true;
	box.TextWrapped = true;
	box.AutomaticSize = Enum.AutomaticSize.XY;
	box.TextXAlignment = Enum.TextXAlignment.Left;
	box.TextYAlignment = Enum.TextYAlignment.Top;
	box.Name = tostring(os.clock());
	box.ClipsDescendants = false;

	if (scroller.GetChildren().size() > 25) {
		let oldest: TextBox;
		scroller.GetChildren().forEach((element: Instance) => {
			if (element.IsA("TextBox")) {
				if (!oldest) {
					oldest = element;
				} else if (tonumber(oldest!.Name)! > tonumber(element.Name)!) {
					oldest = element;
				}
			}
		});
		oldest!.Destroy();
	}

	return box;
}
function send(message: string, messagetype: "text" | "image" | "welcome" | "sound", author: number, comment: string) {
	print("sending message as " + author);
	const request: comradioProtocol = {
		Author: author,
		Content: message,
		Type: messagetype,
		Comment: comment,
	};
	ms.PublishAsync("rorc2", http.JSONEncode(request));
}

ms.SubscribeAsync("rorc2", (message: unknown) => {
	const request: comradioProtocol = http.JSONDecode(
		(message as subscribeCallback).Data as string,
	) as comradioProtocol;
	print("received message from " + request.Author);
	print("type: " + request.Type);
	const author: string = game.GetService("Players").GetNameFromUserIdAsync(request.Author)!;
	const messagetype: string = request.Type;
	if (messagetype === "text") {
		const content = text.FilterStringAsync(request.Content, owner.UserId)!.GetChatForUserAsync(owner.UserId);
		const box = output(`[${author}]: ${content!}`);
	} else if (messagetype === "welcome") {
		const box = output(`Welcome, ${author}! Say "/help" in the chat for a list of commands.`);
	} else {
		const comment = text.FilterStringAsync(request.Comment!, owner.UserId)!.GetChatForUserAsync(owner.UserId);
		const box = output(`[${author}]: ${comment!}`);
		if (messagetype === "image") {
			print("image: " + request.Content);
			const image = new Instance("ImageLabel");
			image.Size = UDim2.fromOffset(300, 300);
			image.Position = new UDim2(1, 0, 0, 10);
			image.ScaleType = Enum.ScaleType.Fit;
			image.Image = request.Content;
			image.Parent = box;
		} else if (messagetype === "sound") {
			print("sound: " + request.Content);
			const button = new Instance("TextButton");
			button.Size = UDim2.fromOffset(50, 50);
			button.Position = new UDim2(1, 0, 0, 10);
			button.TextScaled = true;
			button.BackgroundColor3 = new Color3(0.1, 0.51, 0.98);
			button.Text = "▶";
			button.Parent = box;
			const sound = new Instance("Sound");
			sound.SoundId = request.Content;
			sound.Volume = 1;
			sound.Looped = true;
			sound.Parent = box;
			let playing = false;
			button.MouseButton1Click.Connect(() => {
				playing = !playing;
				if (playing) {
					sound.Play();
					button.Text = "⏸";
				} else {
					sound.Pause();
					button.Text = "▶";
				}
			});
		}
	}
});
send("", "welcome", owner.UserId, "");
output("Using rorc v4 compliant with comradio Protocol v2");

players.GetPlayers().forEach((player: Player) => {
	player.Chatted.Connect((command: string) => {
		if (command.sub(1, 6) === "/send ") {
			send(command.sub(7, -1), "text", player.UserId, "");
		} else if (command.sub(1, 7) === "/image ") {
			const split = command.sub(8, -1).split(" ");
			// eslint-disable-next-line roblox-ts/lua-truthiness
			send(split[0], "image", player.UserId, split[1] || "");
		} else if (command.sub(1, 7) === "/sound ") {
			const split = command.sub(8, -1).split(" ");
			// eslint-disable-next-line roblox-ts/lua-truthiness
			send(split[0], "sound", player.UserId, split[1] || "");
		}
	});
});

export {};