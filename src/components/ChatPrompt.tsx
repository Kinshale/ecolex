import { Button } from '@/components/ui/button';
import { Scale, Upload, FileCheck, X, Send } from 'lucide-react';
import React, { RefObject } from 'react';

interface ChatPromptProps {
	input: string;
	setInput: (val: string) => void;
	isLoading: boolean;
	selectedLaws: any[];
	openModal: () => void;
	uploadedDocument: File | null;
	setUploadedDocument: (file: File | null) => void;
	fileInputRef: RefObject<HTMLInputElement>;
	handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleKeyDown: (e: React.KeyboardEvent) => void;
	handleSubmit: (e: React.FormEvent) => void;
}

export function ChatPrompt({
	input,
	setInput,
	isLoading,
	selectedLaws,
	openModal,
	uploadedDocument,
	setUploadedDocument,
	fileInputRef,
	handleFileUpload,
	handleKeyDown,
	handleSubmit,
}: ChatPromptProps) {
	return (
		<div className="flex justify-center">
			<div className="w-full max-w-3xl">
				<div className="bg-background border rounded-2xl shadow-lg p-4">
					<form onSubmit={handleSubmit} className="flex flex-col gap-2">
						{/* Auto-resizing textarea */}
						<textarea
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							onInput={(e) => {
								const target = e.target as HTMLTextAreaElement;
								target.style.height = 'auto';
								target.style.height = Math.min(target.scrollHeight, 192) + 'px';
							}}
							placeholder="Ask about environmental regulations..."
							className="min-h-[42px] max-h-48 resize-none bg-background border-0 rounded-lg px-3 py-2 text-base focus:outline-none overflow-hidden"
							disabled={isLoading}
							rows={1}
						/>
						{/* Button row below textarea */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{/* Laws Selection Button */}
								<Button
									type="button"
									variant={selectedLaws.length > 0 ? "secondary" : "outline"}
									size="sm"
									onClick={openModal}
									className="h-10 gap-2"
									title="Select Laws"
								>
									<Scale className="w-4 h-4" />
									{selectedLaws.length > 0 ? (
										<span className="text-xs">{selectedLaws.length} Laws</span>
									) : (
										<span className="text-xs">Laws</span>
									)}
								</Button>

								{/* Document Upload Button */}
								<Button
									type="button"
									variant={uploadedDocument ? "secondary" : "outline"}
									onClick={() => fileInputRef.current?.click()}
									className="h-10 gap-2"
									title="Upload Document"
								>
									{uploadedDocument ? (
										<>
											<FileCheck className="w-4 h-4" />
											<span className="text-xs truncate max-w-[80px]">{uploadedDocument.name}</span>
											<button
												onClick={(e) => {
													e.stopPropagation();
													setUploadedDocument(null);
												}}
												className="p-0.5 rounded-full hover:bg-muted"
												title="Remove Document"
												type="button"
											>
												<X className="w-3 h-3" />
											</button>
										</>
									) : (
										<>
											<Upload className="w-4 h-4" />
											<span className="text-xs">Upload</span>
										</>
									)}
								</Button>

								<input
									ref={fileInputRef}
									type="file"
									accept=".pdf"
									className="hidden"
									onChange={handleFileUpload}
								/>
							</div>

							<Button
								type="submit"
								className="h-10 w-10"
								disabled={!input.trim() || isLoading}
								title="Send"
							>
								<Send className="w-4 h-4" />
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
