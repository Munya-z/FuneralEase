using FuneralEase.Application.Content.Queries.GetClaimsChecklistTemplates;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("content")]
[AllowAnonymous]
public class ContentController(ISender sender) : ControllerBase
{
    [HttpGet("claims-checklist-templates")]
    public async Task<IActionResult> GetChecklistTemplates(CancellationToken ct)
    {
        var result = await sender.Send(new GetClaimsChecklistTemplatesQuery(), ct);
        return Ok(result);
    }

    [HttpGet("grief-support")]
    public IActionResult GetGriefSupport()
    {
        return Ok(new
        {
            title = "Grief Support Directory",
            description = "South African organisations offering free or subsidised grief counselling and support.",
            resources = new[]
            {
                new
                {
                    name = "South African Depression and Anxiety Group (SADAG)",
                    phone = "0800 567 567",
                    whatsapp = (string?)"076 882 2775",
                    website = "https://www.sadag.org",
                    description = "24-hour helpline offering grief counselling, trauma support, and referrals to local therapists."
                },
                new
                {
                    name = "Lifeline South Africa",
                    phone = "0861 322 322",
                    whatsapp = (string?)null,
                    website = "https://www.lifelinesa.co.za",
                    description = "Confidential counselling and crisis support. Free to call."
                },
                new
                {
                    name = "FAMSA (Families South Africa)",
                    phone = "011 788 4784",
                    whatsapp = (string?)null,
                    website = "https://www.famsa.org.za",
                    description = "Family counselling and bereavement support with offices across major cities."
                },
                new
                {
                    name = "Child Welfare South Africa",
                    phone = "0800 435 754",
                    whatsapp = (string?)null,
                    website = "https://www.childwelfaresa.org.za",
                    description = "Supports children who have lost a parent or caregiver. Free counselling services."
                },
                new
                {
                    name = "The Grief Support Network SA",
                    phone = "",
                    whatsapp = (string?)null,
                    website = "https://www.griefsupport.co.za",
                    description = "Online community and resources for bereaved South Africans."
                },
            },
            selfCareGuide = new[]
            {
                "Allow yourself to feel grief — there is no 'right' way to mourn.",
                "Lean on trusted family and community members (ubuntu).",
                "Maintain basic routines: eating, sleeping, and gentle exercise.",
                "Limit major decisions in the first few months after loss.",
                "Seek professional help if grief significantly impairs daily life for more than 6 weeks.",
            }
        });
    }

    [HttpGet("repatriation-guide")]
    public IActionResult GetRepatriationGuide()
    {
        return Ok(new
        {
            title = "Repatriation Guide",
            sections = new[]
            {
                new { heading = "Step 1: Notify the South African Embassy", body = "Contact the nearest SA embassy or consulate in the country where the deceased passed away." },
                new { heading = "Step 2: Obtain a Death Certificate", body = "Secure a local death certificate from authorities in the country of death. Get it apostilled or authenticated." },
                new { heading = "Step 3: Engage a Licensed Repatriation Service", body = "Use a funeral parlour that offers international repatriation or contact SA Funeral Practitioners Association." },
                new { heading = "Step 4: Prepare the Deceased for Travel", body = "The deceased must be embalmed and placed in a zinc-lined wooden coffin sealed to international standards." },
                new { heading = "Step 5: Obtain Travel Documents", body = "Secure a permit to export human remains, a laissez-passer, and notify DIRCO." },
                new { heading = "Step 6: Arrange Airfreight or Sea Freight", body = "Coordinate with the airline cargo department. SA Airways and other carriers have specific requirements." },
                new { heading = "Step 7: Clear with Home Affairs on Arrival", body = "Present all documentation at South African port of entry. Customs clearance is required." },
            }
        });
    }
}
