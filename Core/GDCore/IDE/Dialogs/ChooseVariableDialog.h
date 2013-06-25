/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef GDCORE_CHOOSEVARIABLEDIALOG_H
#define GDCORE_CHOOSEVARIABLEDIALOG_H

//(*Headers(ChooseVariableDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/aui/aui.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class VariablesContainer; }
namespace gd { class Project; }
namespace gd { class Layout; }
#include <wx/toolbar.h>
#include <boost/shared_ptr.hpp>
#include <string>

namespace gd
{

/**
 * \brief Dialog used to display variables of a gd::VariablesContainer, edit them and/or choose one.
 *
 * Also offer a nice feature to scan the associated project/layout for undeclared variables.<br>
 * The dialog can be used as an editor only, see the constructor.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseVariableDialog: public wxDialog
{
public:

    /**
     * Default constructor.
     *
     * \param parent The parent window
     * \param variablesContainer A reference to the container to be used
     * \param editingOnly If set to true, the dialog will act as a dialog to edit the variables and not to choose one ( Double click won't close the dialog for example ).
     */
    ChooseVariableDialog(wxWindow* parent, gd::VariablesContainer & variablesContainer, bool editingOnly=false);

    /**
     * Specify an optional associated project
     * \param project Associated project. If different from NULL, global variables from this project will be scanned when searching for undeclared variables
     */
    void SetAssociatedProject(const gd::Project * project);

    /**
     * Specify an optional associated layout
     * \param project Associated project.
     * \param project Associated layout. If different from NULL, layout variables from this layout will be scanned when searching for undeclared variables
     */
    void SetAssociatedLayout(const gd::Project * project, const gd::Layout * layout);

    /**
     * Destructor
     */
    virtual ~ChooseVariableDialog();

    std::string selectedVariable; ///< Contains the name of the last selected variable.

    //(*Declarations(ChooseVariableDialog)
    wxAuiManager* AuiManager1;
    wxStaticBitmap* StaticBitmap2;
    wxPanel* toolbarPanel;
    wxAuiToolBar* toolbar;
    wxListCtrl* variablesList;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxButton* cancelBt;
    wxStaticLine* StaticLine2;
    wxButton* okBt;
    //*)

protected:

    //(*Identifiers(ChooseVariableDialog)
    static const long ID_AUITOOLBAR1;
    static const long ID_PANEL1;
    static const long ID_LISTCTRL1;
    static const long ID_STATICLINE2;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON3;
    //*)
    static const long idAddVar;
    static const long idEditVar;
    static const long idDelVar;
    static const long idMoveUpVar;
    static const long idRenameVar;
    static const long idMoveDownVar;
    static const long ID_Help;
    static const long idFindUndeclared;

private:

    //(*Handlers(ChooseVariableDialog)
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OntoolbarPanelResize(wxSizeEvent& event);
    void OnvariablesListItemActivated(wxListEvent& event);
    void OnvariablesListItemSelect(wxListEvent& event);
    void OnvariablesListKeyDown(wxListEvent& event);
    void OnvariablesListEndLabelEdit(wxListEvent& event);
    void OnvariablesListBeginLabelEdit(wxListEvent& event);
    void OnResize(wxSizeEvent& event);
    //*)
    void OnAddVarSelected(wxCommandEvent& event);
    void OnDelVarSelected(wxCommandEvent& event);
    void OnEditVarSelected(wxCommandEvent& event);
    void OnRenameVarSelected(wxCommandEvent& event);
    void OnMoveUpVarSelected(wxCommandEvent& event);
    void OnMoveDownVarSelected(wxCommandEvent& event);
    void OnFindUndeclaredSelected(wxCommandEvent& event);
    void Refresh();

    gd::VariablesContainer & variablesContainer; ///< gd::VariablesContainer storing the variables
    boost::shared_ptr<gd::VariablesContainer> temporaryContainer; ///< Temporary container used to allow to make temporary changes before applying them to the real variables container if Ok is pressed.
    bool editingOnly; ///< If set to true, the dialog will act as a dialog to edit the variables and not to choose one ( Double click won't close the dialog for example ).
    const gd::Project * associatedProject;
    const gd::Layout * associatedLayout;

    std::string oldName; ///< Used to remember the variable old name when renaming

    DECLARE_EVENT_TABLE()
};

}

#endif
#endif
