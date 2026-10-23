using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.EstateChecklist;

public class EstateChecklist : AggregateRoot<EstateChecklistId>
{
    private readonly List<EstateTask> _tasks = [];

    public HouseholdId HouseholdId { get; private set; }
    public string DeceasedFullName { get; private set; } = string.Empty;
    public DateOnly DateOfDeath { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public IReadOnlyList<EstateTask> Tasks => _tasks.AsReadOnly();

    private EstateChecklist() { }

    public static EstateChecklist Create(HouseholdId householdId, string deceasedFullName, DateOnly dateOfDeath)
    {
        Guard.NotNullOrEmpty(deceasedFullName, nameof(deceasedFullName));

        var checklist = new EstateChecklist
        {
            Id = EstateChecklistId.New(),
            HouseholdId = householdId,
            DeceasedFullName = deceasedFullName,
            DateOfDeath = dateOfDeath,
            CreatedAt = DateTimeOffset.UtcNow
        };

        checklist.PopulateStandardTasks();

        return checklist;
    }

    private void PopulateStandardTasks()
    {
        var sortOrder = 0;

        // Home Affairs
        AddStandardTask("Report death to Home Affairs", "Notify the Department of Home Affairs of the passing within 72 hours.", EstateTaskCategory.HomeAffairs, required: true, ref sortOrder);
        AddStandardTask("Obtain certified death certificate copies x10", "Request at least 10 certified copies of the death certificate for use with insurers, banks, and legal parties.", EstateTaskCategory.HomeAffairs, required: true, ref sortOrder);
        AddStandardTask("Return ID document to Home Affairs", "The deceased's green barcoded ID book or smart ID card must be surrendered.", EstateTaskCategory.HomeAffairs, required: false, ref sortOrder);

        // Banking
        AddStandardTask("Notify all banks of passing", "Contact each bank where the deceased held accounts and provide a certified death certificate.", EstateTaskCategory.Banking, required: false, ref sortOrder);
        AddStandardTask("Freeze joint accounts temporarily", "Request temporary restriction on joint accounts to prevent unauthorised transactions.", EstateTaskCategory.Banking, required: false, ref sortOrder);
        AddStandardTask("Open estate account at bank", "The executor must open a dedicated estate account to receive and disburse estate funds.", EstateTaskCategory.Banking, required: false, ref sortOrder);

        // Insurance
        AddStandardTask("Notify life insurers", "Submit death notification to all life insurance companies where the deceased held policies.", EstateTaskCategory.Insurance, required: false, ref sortOrder);
        AddStandardTask("Submit funeral claims", "File funeral policy claims with the relevant insurers to recover funeral expenses.", EstateTaskCategory.Insurance, required: false, ref sortOrder);
        AddStandardTask("Cancel vehicle/home insurance", "Cancel or transfer short-term insurance policies on assets in the estate.", EstateTaskCategory.Insurance, required: false, ref sortOrder);

        // Legal
        AddStandardTask("Locate the will", "Locate the original signed will. Check with the deceased's attorney, Master of High Court, or Deeds Office.", EstateTaskCategory.Legal, required: true, ref sortOrder);
        AddStandardTask("Appoint executor", "An executor must be nominated (from the will or by heirs) to administer the estate.", EstateTaskCategory.Legal, required: true, ref sortOrder);
        AddStandardTask("Apply for Letters of Executorship at Master of High Court", "Submit the death certificate, original will (if any), and required forms to the Master's office.", EstateTaskCategory.Legal, required: true, ref sortOrder);

        // Medical
        AddStandardTask("Cancel medical aid / gap cover", "Notify the medical aid scheme and cancel the membership to stop further premium deductions.", EstateTaskCategory.Medical, required: false, ref sortOrder);
        AddStandardTask("Request medical records if needed", "Obtain medical records for estate or insurance purposes if required.", EstateTaskCategory.Medical, required: false, ref sortOrder);

        // Property
        AddStandardTask("Notify estate agent if property owned", "Inform the relevant parties about immovable property included in the estate.", EstateTaskCategory.Property, required: false, ref sortOrder);
        AddStandardTask("Cancel rental agreement if renting", "Give notice to the landlord and arrange to terminate any residential lease.", EstateTaskCategory.Property, required: false, ref sortOrder);

        // Social
        AddStandardTask("Cancel SASSA grants", "Notify SASSA to stop social grant payments to prevent overpayments that must be repaid.", EstateTaskCategory.Social, required: false, ref sortOrder);
        AddStandardTask("Cancel pension / provident fund payments", "Contact the pension or provident fund administrator to process the death benefit claims.", EstateTaskCategory.Social, required: false, ref sortOrder);
        AddStandardTask("Notify employer", "Inform the deceased's employer so that outstanding salary, UIF, and death benefits can be processed.", EstateTaskCategory.Social, required: false, ref sortOrder);

        // Utilities
        AddStandardTask("Transfer or cancel electricity/water accounts", "Contact the municipality or Eskom to transfer or close utility accounts.", EstateTaskCategory.Utilities, required: false, ref sortOrder);
        AddStandardTask("Cancel internet/TV subscriptions", "Cancel DStv, fibre, cell phone contracts, and streaming services.", EstateTaskCategory.Utilities, required: false, ref sortOrder);
    }

    private void AddStandardTask(string title, string description, EstateTaskCategory category, bool required, ref int sortOrder)
    {
        _tasks.Add(EstateTask.Create(Id, title, description, category, required, sortOrder++));
    }

    public EstateTask AddTask(string title, string description, EstateTaskCategory category)
    {
        Guard.NotNullOrEmpty(title, nameof(title));

        var sortOrder = _tasks.Count > 0 ? _tasks.Max(t => t.SortOrder) + 1 : 0;
        var task = EstateTask.Create(Id, title, description, category, isRequired: false, sortOrder);
        _tasks.Add(task);
        return task;
    }

    public void CompleteTask(EstateTaskId taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId)
            ?? throw new InvalidOperationException($"Task {taskId} not found in this checklist.");
        task.Complete();
    }

    public void ReopenTask(EstateTaskId taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId)
            ?? throw new InvalidOperationException($"Task {taskId} not found in this checklist.");
        task.Reopen();
    }
}
